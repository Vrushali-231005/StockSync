import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from "multer";
import path from "path"

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js'; // adjust path if needed
import inventoryRoutes from "./routes/inventoryRoutes.js";
import  employeeRoutes from "./routes/employeeRoutes.js";
import InventoryRequestRoutes from './routes/inventoryRequestRoutes.js';

import { fileURLToPath } from "url"
import { dirname } from "path"

import cloudinaryRoutes from "./routes/cloudinaryRoutes.js";

dotenv.config();

const app = express(); // ✅ Move this ABOVE Swagger middleware
const PORT = process.env.PORT || 5757;

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")))


// ✅ Swagger UI route (place after express is initialized)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/inventoryReq",InventoryRequestRoutes);
//app.use("/api/cloudinary", cloudinaryRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Keep-alive route
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "Server is alive 🚀" });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger Docs at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
