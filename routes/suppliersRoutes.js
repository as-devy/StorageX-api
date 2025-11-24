import express from "express";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from "../controllers/suppliersController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All supplier routes require authentication
router.get("/", requireAuth, getSuppliers);
router.get("/:id", requireAuth, getSupplierById);
router.post("/", requireAuth, createSupplier);
router.put("/:id", requireAuth, updateSupplier);
router.delete("/:id", requireAuth, deleteSupplier);

export default router;
