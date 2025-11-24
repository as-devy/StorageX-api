import express from "express";

export default function ownersRoutes(supabase) {
  const router = express.Router();

  // Get owner info for the logged-in user
  router.get("/me", async (req, res) => {
    const { user } = req;
    const { data, error } = await supabase
      .from("owners")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // Update owner profile
  router.put("/me", async (req, res) => {
    const { user } = req;
    const updates = req.body;

    const { data, error } = await supabase
      .from("owners")
      .update(updates)
      .eq("auth_user_id", user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  return router;
}
