import express from "express";
import cors from "cors";
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

// CORS configuration - handle multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://storage-x-main.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list (exact match)
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For development, allow localhost variations
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        // Log for debugging
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle OPTIONS requests explicitly to prevent redirects
app.options('*', cors());

app.use(express.json());

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
