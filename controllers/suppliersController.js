import { supabase } from "../config/supabaseClient.js";

// Helper function to get owner_id from auth user
const getOwnerId = async (authUserId) => {
  const { data, error } = await supabase
    .from("owners")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !data) throw new Error("Owner not found for this user");

  return data.id;
};

/* ----------------------------------------------
   GET ALL SUPPLIERS FOR OWNER
---------------------------------------------- */
export const getSuppliers = async (req, res) => {
  try {
    const ownerId = await getOwnerId(req.user.id);

    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ----------------------------------------------
   GET SINGLE SUPPLIER
---------------------------------------------- */
export const getSupplierById = async (req, res) => {
  try {
    const ownerId = await getOwnerId(req.user.id);
    const supplierId = req.params.id;

    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("id", supplierId)
      .eq("owner_id", ownerId)
      .single();

    if (error || !data) throw new Error("Supplier not found");

    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/* ----------------------------------------------
   CREATE SUPPLIER
---------------------------------------------- */
export const createSupplier = async (req, res) => {
  try {
    const ownerId = await getOwnerId(req.user.id);

    const { data, error } = await supabase
      .from("suppliers")
      .insert([
        {
          ...req.body,
          owner_id: ownerId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ----------------------------------------------
   UPDATE SUPPLIER
---------------------------------------------- */
export const updateSupplier = async (req, res) => {
  try {
    const ownerId = await getOwnerId(req.user.id);
    const supplierId = req.params.id;

    const { data, error } = await supabase
      .from("suppliers")
      .update(req.body)
      .eq("id", supplierId)
      .eq("owner_id", ownerId)
      .select()
      .single();

    if (error || !data) throw new Error("Supplier not found or not yours");

    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ----------------------------------------------
   DELETE SUPPLIER
---------------------------------------------- */
export const deleteSupplier = async (req, res) => {
  try {
    const ownerId = await getOwnerId(req.user.id);
    const supplierId = req.params.id;

    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("id", supplierId)
      .eq("owner_id", ownerId);

    if (error) throw new Error("Failed to delete supplier");

    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
