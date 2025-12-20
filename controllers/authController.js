import { createClient } from "@supabase/supabase-js";
import { ensureOwnerRecord } from "../utils/ownerHelper.js";
import { supabaseUrl, supabaseAnonKey } from "../config/supabaseClient.js";

// Helper to create a temporary client for auth operations
// This prevents polluting the global service-role client with user sessions
const createAuthClient = () => createClient(
  supabaseUrl,
  supabaseAnonKey, // Use ANON key for auth operations, not Service Role
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

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
