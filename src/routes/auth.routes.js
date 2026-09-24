import express from "express";
import * as AuthController from "../controllers/auth.controller.js";
import * as RateLimiter from "../middleware/rateLimiter.js";
import * as PasswordResetController from "../controllers/passwordReset.controller.js";


const router = express.Router();

router.post(
  "/register",
  RateLimiter.registerLimiter,
  AuthController.registerController,
);
router.post(
  "/login",
  RateLimiter.loginLimiter,
  AuthController.loginController,
);
router.post("/refresh", AuthController.refreshController);
router.post("/logout", AuthController.logoutController);

//forget password
router.post(
  "/forgot-password",
  RateLimiter.forgotPasswordLimiter,
  PasswordResetController.forgotPassword,
);
router.post(
  "/reset-password",
  RateLimiter.resetPasswordLimiter,
  PasswordResetController.resetPassword
);
export default router;
