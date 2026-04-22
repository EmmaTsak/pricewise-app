import express from "express";
import cors from "cors";
import helmet from "helmet";
import productRoutes from "./routes/product.routes";
import emailRoutes from "./routes/email.routes";
import { apiLimiter } from "./middleware/rateLimit";

// Create an Express application
const app = express();

// Security middleware
app.use(helmet());

// Allow requests from frontend
app.use(cors());

// Parse JSON
app.use(express.json());

// Apply rate limiting BEFORE routes
app.use("/products", apiLimiter);
app.use("/email-list", apiLimiter);

// API routes
app.use("/products", productRoutes);
app.use("/email-list", emailRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "PriceWise API is running",
  });
});

export default app;