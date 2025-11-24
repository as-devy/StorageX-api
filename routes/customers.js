import express from "express";
export default function customersRoutes(supabase) {
  const router = express.Router();
  
  router.get("/", async (req, res) => {
    const { data, error } = await supabase.from("customers").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  
  router.post("/", async (req, res) => {
    const { shop_id, name, email, phone } = req.body;
    const { data, error } = await supabase
      .from("customers")
      .insert([{ shop_id, name, email, phone }])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data[0]);
  });
  
  return router;
}
