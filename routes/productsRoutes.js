import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/", requireAuth, getProducts);
router.get("/:id", requireAuth, getProduct);

router.post("/", requireAuth, addProduct);

router.put("/:id", requireAuth, updateProduct);

router.delete("/:id", requireAuth, deleteProduct);

export default router;
