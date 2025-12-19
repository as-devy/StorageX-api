import { supabase } from '../config/supabaseClient.js';

/**
 * Helper function to ensure owner record exists (get or create)
 * This can be used across controllers to ensure owner records exist
 */
export const ensureOwnerRecord = async (authUserId, userMetadata = {}) => {
  try {
    console.log("🔍 Checking for owner record for user:", authUserId);
    
    // Validate Supabase client is configured
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    
    // First, try to get existing owner
    const { data: existingOwner, error: fetchError } = await supabase
      .from('owners')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no record exists

    // If owner exists, return it
    if (existingOwner && !fetchError) {
      console.log("✅ Owner record already exists:", existingOwner.id);
      return existingOwner.id;
    }

    // If there's a fetch error that's not "not found", log it but still try to create
    // PGRST116 is the Supabase error code for "no rows returned" with single()
    // With maybeSingle(), we get null data instead of an error
    if (fetchError) {
      console.warn("⚠️ Error fetching owner (will try to create):", {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details
      });
      // Still try to create - might be a transient issue or "not found" case
    }

    // Use provided metadata or defaults
    let metadata = userMetadata;

    // Create new owner record
    // Only include fields that are not null to avoid constraint issues
    const ownerData = {
      auth_user_id: authUserId,
    };
    
    // Only add optional fields if they have values
    if (metadata.full_name) ownerData.full_name = metadata.full_name;
    if (metadata.company_name) ownerData.company_name = metadata.company_name;
    if (metadata.phone) ownerData.phone = metadata.phone;

    console.log("📝 Creating owner record with data:", JSON.stringify(ownerData, null, 2));

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
        hint: createError.hint,
        // Log the full error object
        fullError: JSON.stringify(createError, Object.getOwnPropertyNames(createError))
      });
      
      // Provide more helpful error message
      let errorMsg = createError.message || "Failed to create owner record";
      if (createError.code === '23505') {
        errorMsg = "Owner record already exists (duplicate key)";
      } else if (createError.code === '23503') {
        errorMsg = "Foreign key constraint violation - check database relationships";
      } else if (createError.details) {
        errorMsg = `${errorMsg}: ${createError.details}`;
      }
      
      const enhancedError = new Error(errorMsg);
      enhancedError.code = createError.code;
      enhancedError.details = createError.details;
      enhancedError.hint = createError.hint;
      throw enhancedError;
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

