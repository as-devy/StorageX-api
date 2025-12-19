import { supabase } from "../config/supabaseClient.js";
import { ensureOwnerRecord } from "../utils/ownerHelper.js";

// Helper function to get owner_id from auth user (with auto-create fallback)
const getOwnerId = async (authUserId, userMetadata = {}) => {
  try {
    const { data, error } = await supabase
      .from("owners")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (data && !error) {
      return data.id;
    }

    // Owner doesn't exist, create it
    return await ensureOwnerRecord(authUserId, userMetadata);
  } catch (err) {
    throw new Error("Failed to get or create owner record");
  }
};

/* ----------------------------------------------
   GET ALL SUPPLIERS FOR OWNER
---------------------------------------------- */
export const getSuppliers = async (req, res) => {
  try {
    const ownerId = await getOwnerId(req.user.id, {
      full_name: req.user.user_metadata?.full_name,
      company_name: req.user.user_metadata?.company_name,
      phone: req.user.user_metadata?.phone,
    });

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
    const ownerId = await getOwnerId(req.user.id, {
      full_name: req.user.user_metadata?.full_name,
      company_name: req.user.user_metadata?.company_name,
      phone: req.user.user_metadata?.phone,
    });
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
    const ownerId = await getOwnerId(req.user.id, {
      full_name: req.user.user_metadata?.full_name,
      company_name: req.user.user_metadata?.company_name,
      phone: req.user.user_metadata?.phone,
    });

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
    const ownerId = await getOwnerId(req.user.id, {
      full_name: req.user.user_metadata?.full_name,
      company_name: req.user.user_metadata?.company_name,
      phone: req.user.user_metadata?.phone,
    });
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
    const ownerId = await getOwnerId(req.user.id, {
      full_name: req.user.user_metadata?.full_name,
      company_name: req.user.user_metadata?.company_name,
      phone: req.user.user_metadata?.phone,
    });
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
