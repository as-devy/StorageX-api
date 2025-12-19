import { supabase } from "../config/supabaseClient.js";

/* -------------------------------------------------------
   Helper: Get owner ID from auth_user_id
------------------------------------------------------- */
async function getOwnerId(authUserId) {
  const { data, error } = await supabase
    .from("owners")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !data) return null;
  return data.id;
}

/* -------------------------------------------------------
   Helper: Get all shops belonging to the owner
------------------------------------------------------- */
async function getOwnerShops(ownerId) {
  const { data, error } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", ownerId);

  if (error) throw error;
  return data?.map(s => s.id) || [];
}

/* -------------------------------------------------------
   GET all orders for the owner
------------------------------------------------------- */
export const getOrders = async (req, res) => {
  try {
    const ownerId = await getOwnerId(req.user.id);
    if (!ownerId) return res.status(404).json({ error: "Owner not found" });

    const shopIds = await getOwnerShops(ownerId);
    if (shopIds.length === 0) return res.status(200).json([]);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customer_id (
          id,
          full_name,
          email
        ),
        shop:shop_id (
          id,
          name
        )
      `)
      .in("shop_id", shopIds)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data ?? []);
  } catch (err) {
    console.error("getOrders error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------------------------------------
   ADD new order
------------------------------------------------------- */
export const addOrder = async (req, res) => {
  try {
    const { shop_id, customer_id, order_number, item_count, total_amount, status } = req.body;

    if (!shop_id || !customer_id || !order_number)
      return res.status(400).json({ error: "Missing required fields" });

    const ownerId = await getOwnerId(req.user.id);
    if (!ownerId) return res.status(404).json({ error: "Owner not found" });

    // Ensure this shop belongs to the owner
    const shopIds = await getOwnerShops(ownerId);
    if (!shopIds.includes(shop_id))
      return res.status(403).json({ error: "Not your shop" });

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          shop_id,
          customer_id,
          order_number,
          item_count,
          total_amount,
          status: status || "Pending"
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("addOrder error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------------------------------------
   UPDATE order
------------------------------------------------------- */
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ownerId = await getOwnerId(req.user.id);
    if (!ownerId) return res.status(404).json({ error: "Owner not found" });

    const shopIds = await getOwnerShops(ownerId);

    // Make sure order belongs to one of the owner's shops
    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("shop_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingOrder)
      return res.status(404).json({ error: "Order not found" });

    if (!shopIds.includes(existingOrder.shop_id))
      return res.status(403).json({ error: "Not your order" });

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("updateOrder error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------------------------------------
   DELETE order
------------------------------------------------------- */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const ownerId = await getOwnerId(req.user.id);
    if (!ownerId) return res.status(404).json({ error: "Owner not found" });

    const shopIds = await getOwnerShops(ownerId);

    // Verify the order belongs to the owner
    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("shop_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingOrder)
      return res.status(404).json({ error: "Order not found" });

    if (!shopIds.includes(existingOrder.shop_id))
      return res.status(403).json({ error: "Unauthorized" });

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    console.error("deleteOrder error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
