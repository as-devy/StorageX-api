import { supabase } from '../config/supabaseClient.js';

/**
 * Helper function to ensure owner record exists (get or create)
 * This can be used across controllers to ensure owner records exist
 */
export const ensureOwnerRecord = async (authUserId, userMetadata = {}) => {
  try {
    console.log("🔍 Checking for owner record for user:", authUserId);
    
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

    // Use provided metadata or defaults
    let metadata = userMetadata;

    // Create new owner record
    const ownerData = {
      auth_user_id: authUserId,
      full_name: metadata.full_name || null,
      company_name: metadata.company_name || null,
      phone: metadata.phone || null,
    };

    console.log("📝 Creating owner record with data:", ownerData);

    const { data: newOwner, error: createError } = await supabase
      .from('owners')
      .insert([ownerData])
      .select('id')
      .single();

    if (createError) {
      console.error("❌ Error creating owner record:", {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint
      });
      throw createError;
    }

    if (!newOwner) {
      throw new Error("Failed to create owner record - no data returned");
    }

    console.log("✅ Created new owner record:", newOwner.id);
    return newOwner.id;
  } catch (err) {
    console.error("❌ Error ensuring owner record:", {
      message: err.message,
      code: err.code,
      details: err.details
    });
    throw err;
  }
};

