import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";
dotenv.config();

// Helper to create a temporary client for auth operations
// This prevents polluting the global service-role client with user sessions
const createAuthClient = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY, // Use ANON key for auth operations, not Service Role
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// Helper function to ensure owner record exists (get or create)
const ensureOwnerRecord = async (authUserId, userMetadata = {}) => {
  try {
    // First, try to get existing owner
    const { data: existingOwner, error: fetchError } = await supabase
      .from('owners')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single();

    // If owner exists, return it
    if (existingOwner && !fetchError) {
      console.log("✅ Owner record already exists:", existingOwner.id);
      return existingOwner.id;
    }

    // If error is "not found" (PGRST116) or no data, create new owner record
    // PGRST116 is the Supabase error code for "no rows returned"
    if (fetchError && fetchError.code !== 'PGRST116') {
      // If it's a different error, log it but still try to create
      console.warn("⚠️ Unexpected error fetching owner:", fetchError);
    }

    // Create new owner record
    const ownerData = {
      auth_user_id: authUserId,
      full_name: userMetadata.full_name || null,
      company_name: userMetadata.company_name || null,
      phone: userMetadata.phone || null,
    };

    const { data: newOwner, error: createError } = await supabase
      .from('owners')
      .insert([ownerData])
      .select('id')
      .single();

    if (createError) {
      console.error("❌ Error creating owner record:", createError);
      throw createError;
    }

    if (!newOwner) {
      throw new Error("Failed to create owner record - no data returned");
    }

    console.log("✅ Created new owner record:", newOwner.id);
    return newOwner.id;
  } catch (err) {
    console.error("❌ Error ensuring owner record:", err);
    throw err;
  }
};

export const signup = async (req, res) => {
  const { email, password, full_name, company_name, phone } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const authClient = createAuthClient();
  const { data, error } = await authClient.auth.signUp({
    email,
    password,
    options: { data: { full_name, company_name, phone } }
  });

  if (error) return res.status(400).json({ error: error.message });
  
  // Create owner record after successful signup
  if (data.user) {
    try {
      await ensureOwnerRecord(data.user.id, {
        full_name,
        company_name,
        phone
      });
    } catch (ownerError) {
      console.error("⚠️ Warning: Failed to create owner record:", ownerError);
      // Don't fail signup if owner creation fails - it can be created on first login
    }
  }

  res.status(201).json({ message: "User registered", user: data.user });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const authClient = createAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  // Ensure owner record exists (for backward compatibility with existing users)
  if (data.user) {
    try {
      const userMetadata = data.user.user_metadata || {};
      await ensureOwnerRecord(data.user.id, {
        full_name: userMetadata.full_name,
        company_name: userMetadata.company_name,
        phone: userMetadata.phone
      });
    } catch (ownerError) {
      console.error("⚠️ Warning: Failed to ensure owner record:", ownerError);
      // Continue with login even if owner creation fails
    }
  }

  const token = data.session.access_token;
  // console.log("🔑 Auth First token:", token);
  const expiresIn = 60 * 60 * 24 * 60; // 2 months in seconds (60 days * 24 hours * 60 minutes * 60 seconds)
  const maxAge = expiresIn * 1000; // Convert to milliseconds for cookie

  // Set HTTP-only cookie with 2-month expiration
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    sameSite: 'lax',
    maxAge: maxAge, // 2 months
    path: '/'
  });

  console.log("🔑 Auth TThe token:", token);
  res.json({
    message: "Login successful",
    user: data.user,
    token: token // Still return token for backward compatibility with localStorage
  });
};

export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

export const logout = async (req, res) => {
  // Clear the auth token cookie
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  res.json({ message: 'Logout successful' });
};
