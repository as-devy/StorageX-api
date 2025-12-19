import { supabase } from '../config/supabaseClient.js';
import { ensureOwnerRecord } from '../utils/ownerHelper.js';

/**
 * ✅ Get all customers for all shops belonging to the authenticated owner
 */
export const getCustomers = async (req, res) => {
  try {
    console.log("🔑 Auth user ID:", req.user.id);

    // 1️⃣ Get or create the owner's internal ID using auth_user_id
    let ownerId;
    try {
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .select('id')
        .eq('auth_user_id', req.user.id)
        .single();

      if (ownerData && !ownerError) {
        ownerId = ownerData.id;
        console.log("✅ Found existing owner ID:", ownerId);
      } else {
        // Owner doesn't exist, create it
        console.log("⚠️ Owner record not found, creating...");
        ownerId = await ensureOwnerRecord(req.user.id, {
          full_name: req.user.user_metadata?.full_name,
          company_name: req.user.user_metadata?.company_name,
          phone: req.user.user_metadata?.phone,
        });
        console.log("✅ Created owner ID:", ownerId);
      }
    } catch (ownerErr) {
      console.error("❌ Error getting/creating owner:", ownerErr);
      throw new Error('Failed to get or create owner record. Please try signing out and back in.');
    }
    console.log("👤 Owner ID:", ownerId);

    // 2️⃣ Get all shops owned by this owner
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', ownerId);

    if (shopsError) throw shopsError;

    if (!shops || shops.length === 0) {
      return res.status(200).json([]);
    }

    const shopIds = shops.map((s) => s.id);
    console.log("shops", shopIds);

    // 3️⃣ Fetch all customers in those shops
    const { data, error } = await supabase
      .from('shops_customers')
      .select(`
        *,
        shop:shop_id (
          id,
          name,
          owner_id
        )
      `)
      .in('shop_id', shopIds)
      .order('joinDate', { ascending: false });

    if (error) throw error;

    const customers = (data ?? []).map((record) => ({
      ...record,
      status: record.status ?? 'Active',
    }));

    console.log("✅ Found customers:", customers.length);
    res.status(200).json(customers);
  } catch (err) {
    console.error('❌ Error fetching customers:', err.message);
    res.status(400).json({ error: err.message });
  }
};



/**
 * ✅ Add new customer to a specific shop
 */
export const addCustomer = async (req, res) => {
  try {
    const { shop_id, full_name, email, phone, location, status } = req.body;

    if (!shop_id || !full_name)
      return res.status(400).json({ error: 'Missing required fields' });

    // RLS ensures owner can only add to their own shop
    const customerData = {
      shop_id,
      full_name,
      email: email || null,
      phone: phone || null,
      location: location || null,
      status: status || 'Active'
    };

    const { data, error } = await supabase
      .from('shops_customers')
      .insert([customerData])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error adding customer:', err.message);
    res.status(400).json({ error: err.message });
  }
};

/**
 * ✅ Update a customer’s info
 */
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('shops_customers')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (err) {
    console.error('Error updating customer:', err.message);
    res.status(400).json({ error: err.message });
  }
};

/**
 * ✅ Delete a customer
 */
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('shops_customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting customer:', err.message);
    res.status(400).json({ error: err.message });
  }
};
