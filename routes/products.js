import express from "express";
export default function productsRoutes(supabase) {
  const router = express.Router();
  router.get("/", async (req, res) => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  
  router.post("/", async (req, res) => {
    const { shop_id, name, sku, category, price, cost, stock } = req.body;
    const { data, error } = await supabase
      .from("products")
      .insert([{ shop_id, name, sku, category, price, cost, stock }])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data[0]);
  });
  
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });
  
  return router;
}
