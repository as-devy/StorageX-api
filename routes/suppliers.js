import express from "express";

export default function suppliersRoutes(supabase) {
  const router = express.Router();
  /**
   * @route GET /suppliers
   * @desc Get all suppliers (with all columns)
   */
  router.get("/", async (req, res) => {
    // Assuming the security layer is handled elsewhere or for a single-shop application.
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("owner_id", req.owner_id);

    if (error) {
      console.error("Error fetching suppliers:", error.message);
      return res.status(400).json({ error: error.message });
    }
    res.json(data);
  });

  /**
   * @route POST /suppliers
   * @desc Add a new supplier with all relevant fields
   */
  router.post("/", async (req, res) => {
    const {
      shop_id,
      name,
      email,
      phone,
      address,
      category,
      status,
      rating,
      location_city,
      location_state,
      last_order_date
    } = req.body;

    const newSupplierData = {
      shop_id,
      name,
      email,
      phone,
      address,
      category,
      status,
      rating,
      location_city,
      location_state,
      last_order_date
    };

    const { data, error } = await supabase
      .from("suppliers")
      .insert([newSupplierData])
      .select()
      .single();

    if (error) {
      console.error("Error adding new supplier:", error.message);
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
  });

  /**
   * @route PUT /suppliers/:id
   * @desc Update supplier info (allows updating any field)
   */
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    // req.body contains the updates (e.g., { name: 'New Name', status: 'inactive' })
    const updates = req.body;

    const { data, error } = await supabase
      .from("suppliers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating supplier ${id}:`, error.message);
      return res.status(400).json({ error: error.message });
    }
    res.json(data);
  });

  /**
   * @route DELETE /suppliers/:id
   * @desc Delete supplier
   */
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("suppliers").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting supplier ${id}:`, error.message);
      return res.status(400).json({ error: error.message });
    }
    res.json({ success: true, message: `Supplier ${id} deleted successfully.` });
  });

  return router;
}