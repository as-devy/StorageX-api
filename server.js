import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import ownersRoutes from "./routes/ownersRoutes.js";
import shopsRoutes from "./routes/shopsRoutes.js";
import suppliersRoutes from "./routes/suppliersRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import customersRoutes from "./routes/customersRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";

dotenv.config();
const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL?.trim() || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/owners", ownersRoutes);
app.use("/shops", shopsRoutes);
app.use("/suppliers", suppliersRoutes);
app.use("/products", productsRoutes);
app.use("/customers", customersRoutes);
app.use("/orders", ordersRoutes);

app.get("/", (req, res) => res.send("✅ API Running"));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
