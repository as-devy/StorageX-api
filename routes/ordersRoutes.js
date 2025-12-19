import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder
} from "../controllers/ordersController.js";

const router = express.Router();
router.get("/", requireAuth, getOrders);

router.post("/", requireAuth, addOrder);

router.patch("/:id", requireAuth, updateOrder);

router.delete("/:id", requireAuth, deleteOrder);

export default router;
