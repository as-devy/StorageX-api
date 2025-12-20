import { supabase } from "../config/supabaseClient.js";

/**
 * Ensures an owner record exists for the given auth user ID.
 * If it doesn't exist, it creates one.
 */
export const ensureOwnerRecord = async (authUserId, metadata = {}) => {
    try {
        // 1. Check if record exists
        const { data: existingOwner, error: fetchError } = await supabase
            .from('owners')
            .select('id')
            .eq('auth_user_id', authUserId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 is "no rows found", which is expected if record doesn't exist
            throw fetchError;
        }

        if (existingOwner) {
            return existingOwner;
        }

        // 2. Create record if it doesn't exist
        const { data: newOwner, error: insertError } = await supabase
            .from('owners')
            .insert([
                {
                    auth_user_id: authUserId,
                    full_name: metadata.full_name || 'New Owner',
                    company_name: metadata.company_name || 'My Company',
                    phone: metadata.phone || null
                }
            ])
            .select()
            .single();

        if (insertError) throw insertError;

        console.log(`✅ Created owner record for user ${authUserId}`);
        return newOwner;
    } catch (error) {
        console.error("❌ Error in ensureOwnerRecord:", error.message);
        throw error;
    }
};
