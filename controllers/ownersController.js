import { supabase } from "../config/supabaseClient.js";

export const getOwners = async (req, res) => {
  const { data, error } = await supabase.from("owners").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const getMyOwner = async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from("owners")
    .select("*")
    .eq("auth_user_id", userId)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
