import express from "express";
import * as AuthController from "../controllers/auth.controller.js";
import * as RateLimiter from "../middleware/rateLimiter";

const router = express.Router();

router.post(
  "/register",
  RateLimiter.authRateLimiter,
  AuthController.registerController,
);
router.post(
  "/login",
  RateLimiter.authRateLimiter,
  AuthController.loginController,
);
router.post("/refresh", AuthController.refreshController);
router.post("/logout", AuthController.logoutController);

export default router;
