import express from "express";

export default function ordersRoutes(supabase) {
  const router = express.Router();

  /**
   * Middleware to extract owner_id (for example from headers or auth token)
   */
  router.use((req, res, next) => {
    // Option 1: from Supabase Auth middleware (recommended)
    // const owner_id = req.user?.id;

    // Option 2: from custom header if you’re testing without auth
    const owner_id = req.headers["owner-id"];

    if (!owner_id) {
      return res.status(401).json({ error: "Missing owner ID" });
    }

    req.owner_id = owner_id;
    next();
  });

  /**
   * @route GET /orders
   * @desc Get all orders for the current owner's shops
   */
  router.get("/", async (req, res) => {
    const { owner_id } = req;

    // Get all shop IDs belonging to this owner
    const { data: shops, error: shopError } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", owner_id);

    if (shopError) {
      console.error("Error fetching shops:", shopError.message);
      return res.status(400).json({ error: shopError.message });
    }

    const shopIds = shops.map(s => s.id);

    if (shopIds.length === 0) {
      return res.json([]); // owner has no shops
    }

    // Get all orders belonging to those shops
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("shop_id", shopIds);

    if (error) {
      console.error("Error fetching orders:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  });

  /**
   * @route POST /orders
   * @desc Add a new order for an owner's shop
   */
  router.post("/", async (req, res) => {
    const { owner_id } = req;
    const { 
      shop_id, 
      customer_id, 
      order_number,
      customer_email,
      item_count,
      total_amount, 
      status, 
      order_date,
      tracking_number
    } = req.body;

    // Validate the shop actually belongs to this owner
    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .select("id")
      .eq("id", shop_id)
      .eq("owner_id", owner_id)
      .single();

    if (shopError || !shopData) {
      return res.status(403).json({ error: "You don't own this shop" });
    }

    const newOrderData = {
      shop_id, 
      customer_id, 
      order_number, 
      customer_email, 
      item_count, 
      total_amount, 
      status, 
      ...(order_date && { order_date }),
      tracking_number
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([newOrderData])
      .select();

    if (error) {
      console.error("Error adding new order:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  });

  return router;
}
