import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the API root directory
dotenv.config({ path: join(__dirname, "..", ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error("❌ Error: SUPABASE_URL environment variable is not set!");
  console.error("   Please create a .env file in the StorageX-api directory with:");
  console.error("   SUPABASE_URL=your_supabase_url");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key");
  throw new Error("SUPABASE_URL environment variable is required. Please check your .env file.");
}

if (!supabaseServiceRoleKey) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set!");
  console.error("   Please create a .env file in the StorageX-api directory with:");
  console.error("   SUPABASE_URL=your_supabase_url");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key");
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required. Please check your .env file.");
}

// Create Supabase client with service role key
// Service role key can validate any user's access token
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
