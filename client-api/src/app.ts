import express from "express";
import cors from "cors";
import helmet from "helmet";
import productRoutes from "./routes/product.routes";
import emailRoutes from "./routes/email.routes";
import { apiLimiter } from "./middleware/rateLimit";

const app = express();

app.use(helmet());

const allowedOrigins =
  process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) || [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools like curl/postman that may not send an origin.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
  })
);

app.use(express.json());

app.use("/products", apiLimiter);
app.use("/email-list", apiLimiter);

app.use("/products", productRoutes);
app.use("/email-list", emailRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "PriceWise API is running",
  });
});

export default app;