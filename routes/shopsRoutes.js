import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getShops, addShop } from "../controllers/shopsController.js";

const router = express.Router();
router.get("/", requireAuth, getShops);
router.post("/", requireAuth, addShop);

export default router;
