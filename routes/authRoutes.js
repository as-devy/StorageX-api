import express from "express";
import { signup, login, getProfile } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", login);
router.post("/login", login); // Alias for /signin
router.get("/me", requireAuth, getProfile);

export default router;
