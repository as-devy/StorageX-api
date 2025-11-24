import express from "express";
export default function shopsRoutes(supabase) {
  const router = express.Router();
  
  router.get("/", async (req, res) => {
    const { data, error } = await supabase.from("shops").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  
  router.post("/", async (req, res) => {
    const { name, location } = req.body;
    const { data, error } = await supabase.from("shops").insert([{ name, location }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data[0]);
  });
  
  return router;
}
