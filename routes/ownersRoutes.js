import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getOwners, getMyOwner } from "../controllers/ownersController.js";

const router = express.Router();
router.get("/", requireAuth, getOwners);
router.post("/", requireAuth, getMyOwner);

export default router;
