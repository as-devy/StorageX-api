import { supabase } from "../config/supabaseClient.js";

// ----------------------------------------------------
// Helper: Get owner internal ID from auth_user_id
// ----------------------------------------------------
const getOwnerId = async (authUserId) => {
  const { data, error } = await supabase
    .from("owners")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !data) return null;
  return data.id;
};

// ----------------------------------------------------
// Get Products
// ----------------------------------------------------
export const getProducts = async (req, res) => {
  try {
    const ownerId = await getOwnerId(req.user.id);
    if (!ownerId)
      return res.status(404).json({ error: "Owner not found" });

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        stock,
        owner_id,
        shop_id,
        supplier_id
      `)
      .eq("owner_id", ownerId);

    if (error)
      return res.status(400).json({ error: error.message });

    return res.json(data);
  } catch (err) {
    console.error("getProducts error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----------------------------------------------------
// Get Single Product
// ----------------------------------------------------
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching single product ID:", id);

    const ownerId = await getOwnerId(req.user.id);
    if (!ownerId) {
      console.error("❌ Owner not found for user:", req.user.id);
      return res.status(404).json({ error: "Owner not found" });
    }

    // Only selecting columns we are sure exist in the table based on addProduct/getProducts
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        stock,
        owner_id,
        shop_id,
        supplier_id,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .eq("owner_id", ownerId)
      .single();

    if (error) {
      console.error(`❌ getProduct DB Error [ID: ${id}]:`, error.message);
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ Product fetched successfully:", data.name);
    return res.json(data);
  } catch (err) {
    console.error("getProduct error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----------------------------------------------------
// Add Product
// ----------------------------------------------------
export const addProduct = async (req, res) => {
  try {
    const { name, price, stock, shop_id, supplier_id, description } = req.body;

    const ownerId = await getOwnerId(req.user.id);
    if (!ownerId)
      return res.status(404).json({ error: "Owner not found" });

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          owner_id: ownerId,
          shop_id,
          supplier_id: supplier_id || null,
          name,
          description: description || null,
          price,
          stock
        }
      ])
      .select()
      .single();

    if (error)
      return res.status(400).json({ error: error.message });

    return res.status(201).json(data);
  } catch (err) {
    console.error("addProduct error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


// ----------------------------------------------------
// Update Product
// ----------------------------------------------------
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, supplier_id } = req.body;

    const ownerId = await getOwnerId(req.user.id);
    if (!ownerId)
      return res.status(404).json({ error: "Owner not found" });

    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        price,
        stock,
        supplier_id: supplier_id || null,
        updated_at: new Date()
      })
      .eq("id", id)
      .eq("owner_id", ownerId)
      .select()
      .single();

    if (error)
      return res.status(400).json({ error: error.message });

    return res.json(data);
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----------------------------------------------------
// Delete Product
// ----------------------------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const ownerId = await getOwnerId(req.user.id);
    if (!ownerId)
      return res.status(404).json({ error: "Owner not found" });

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("owner_id", ownerId);

    if (error)
      return res.status(400).json({ error: error.message });

    return res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
