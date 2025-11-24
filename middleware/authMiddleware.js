import { supabase } from "../config/supabaseClient.js";

/**
 * Simple, reliable auth middleware
 * Validates JWT tokens from Supabase
 */
export async function requireAuth(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(7).trim(); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }

    // Validate token using Supabase
    // Service role key can validate any user's access token
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: error?.message 
      });
    }

    // Attach user to request
    req.user = data.user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication error' });
  }
}
