// middleware/authMiddleware.js

import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "../config/supabaseClient.js";

// Create a client for auth validation using ANON key (same as authController)
// This ensures token validation works correctly
const createAuthClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    console.log("🔑 Token preview:", token ? `${token.substring(0, 20)}...` : "MISSING");

    if (!token) {
      console.error("❌ No token provided in Authorization header");
      return res.status(401).json({ error: "No token provided" });
    }

    // Validate environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("❌ Supabase environment variables not configured:", {
        hasUrl: !!process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY
      });
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Create auth client and validate token
    const authClient = createAuthClient();
    const { data, error } = await authClient.auth.getUser(token);

    if (error) {
      console.error("❌ Supabase Auth Error:", {
        message: error.message,
        status: error.status,
        name: error.name
      });
      return res.status(401).json({ error: "Invalid token. Please sign in again." });
    }

    if (!data || !data.user) {
      console.error("❌ No user found for token");
      return res.status(401).json({ error: "Invalid token. Please sign in again." });
    }

    console.log("✅ User authenticated:", data.user.id);
    req.user = data.user;
    next();

  } catch (err) {
    console.error("❌ Auth Middleware Error:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ error: "Authentication failed" });
  }
};
