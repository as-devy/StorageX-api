// middleware/authMiddleware.js

import { supabase } from "../config/supabaseClient.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    console.log("🔑 Token preview:", token ? `${token.substring(0, 20)}...` : "MISSING");
    if (!token) return res.status(401).json({ error: "No token provided" });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error("❌ Supabase Auth Error:", error.message);
      return res.status(401).json({ error: "Invalid token" });
    }

    if (!user) {
      console.error("❌ No user found for token");
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("✅ User authenticated:", user.id);
    req.user = user;
    next();


  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(500).json({ error: "Auth failed" });
  }
};
