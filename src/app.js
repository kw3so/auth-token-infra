import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { CORS_ORIGIN } from "./config/config.env.js";

const app = express();
//use middleware
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

//Use route
//auth
app.use("/api/auth", authRoutes);
//users

//Error handler
app.use(errorHandler);

export default app;
