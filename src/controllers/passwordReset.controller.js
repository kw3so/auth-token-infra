import * as PasswordResetService from "../services/passwordReset.service.js";
import { ValidationError } from "../errors/auth.errors.js";

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError("Email is required");
    }
    const {data, error} = await PasswordResetService.requestPasswordReset(email);
    
    res.status(200).json({
      message:
        "if an account with this email exists, a reset link has been sent",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.query;
    if (!token || !newPassword) {
      throw new ValidationError("the token and newPassword is required");
    }
    await PasswordResetService.resetPassword({rawToken:token, newPassword});

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    next(err);
  }
};
