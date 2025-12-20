import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Validate and sanitize environment variables
const sanitizeEnvVar = (name, value) => {
  if (!value) return value;

  const trimmed = value.trim();
  // JWT tokens and URLs shouldn't have spaces. If there's a space, it's likely 
  // a misconfiguration (e.g. "token PORT=4000")
  if (trimmed.includes(' ')) {
    console.warn(`⚠️ Warning: Environment variable ${name} contains a space. Truncating at first space.`);
    return trimmed.split(' ')[0];
  }
  return trimmed;
};

const supabaseUrl = sanitizeEnvVar("SUPABASE_URL", process.env.SUPABASE_URL);
const supabaseServiceRoleKey = sanitizeEnvVar("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabaseAnonKey = sanitizeEnvVar("SUPABASE_ANON_KEY", process.env.SUPABASE_ANON_KEY);

if (!supabaseUrl) {
  console.error("❌ SUPABASE_URL environment variable is not set");
  throw new Error("SUPABASE_URL environment variable is required");
}

if (!supabaseServiceRoleKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required");
}

if (!supabaseAnonKey) {
  console.error("❌ SUPABASE_ANON_KEY environment variable is not set");
  throw new Error("SUPABASE_ANON_KEY environment variable is required");
}

console.log("🚀 Initializing Supabase client with URL:", supabaseUrl);

export { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey };

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);
