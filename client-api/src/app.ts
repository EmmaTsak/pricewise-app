import express from "express";
import cors from "cors";
import helmet from "helmet";
import productRoutes from "./routes/product.routes";
import emailRoutes from "./routes/email.routes";

// Create an Express application
const app = express();

// Enable security headers
app.use(helmet());

// Allow requests from the frontend
app.use(cors());

// Allow the server to read JSON data from requests
app.use(express.json());

// API routes
app.use("/products", productRoutes);

// Email routes
app.use("/email-list", emailRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "PriceWise API is running"
    });
});

export default app;