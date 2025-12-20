import { supabase } from '../config/supabaseClient.js';

/**
 * ✅ Get all shops for the logged-in owner
 */
export const getShops = async (req, res) => {
  try {
    const authUserId = req.user.id;

    // 1️⃣ Get internal owner record
    const { data: ownerData, error: ownerError } = await supabase
      .from('owners')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single();

    if (ownerError || !ownerData)
      throw new Error('Owner not found for this user');

    const ownerId = ownerData.id;

    // 2️⃣ Get shops belonging to this owner
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching shops:', err.message);
    res.status(400).json({ error: err.message });
  }
};

/**
 * ✅ Add new shop for logged-in owner
 */
export const addShop = async (req, res) => {
  try {
    const { name, location } = req.body;
    const authUserId = req.user.id;

    if (!name)
      return res.status(400).json({ error: 'Shop name is required' });

    // 1️⃣ Get owner ID from auth
    const { data: ownerData, error: ownerError } = await supabase
      .from('owners')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single();

    if (ownerError || !ownerData)
      throw new Error('Owner not found for this user');

    const ownerId = ownerData.id;

    // 2️⃣ Insert new shop
    const { data, error } = await supabase
      .from('shops')
      .insert([{ owner_id: ownerId, name, location }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error adding shop:', err.message);
    res.status(400).json({ error: err.message });
  }
};
