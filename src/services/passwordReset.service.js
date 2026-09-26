import * as passwordResetTokenRepository from "../repositories/passwordResetToken.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as cryptoUtils from "../utils/crypto.utils.js";
import * as AuthError from "../errors/auth.errors.js";
import { revokeAllTokensForUser } from "../repositories/refreshtoken.repository.js";
import { hashPassword } from "../utils/password.utils.js";
import * as ConfigEnv from "../config/config.env.js";
import { emailService } from "./email.service.js";

export const requestPasswordReset = async (email) => {
  const PASSWORD_RESET_TTL_MS =
    ConfigEnv.PASSWORD_RESET_TTL_MINUTES * 60 * 1000;

  const user = await userRepository.findByEmail(email);

  //Decision, we always respond as if request successful, no throw
  if (!user) {
    return;
  }

  const { password: _pw, ...safeUser } = user; //Destructure after check if user is returned.

  //Invalidate all the resetTokens
  await passwordResetTokenRepository.invalidateAllForUser(safeUser.id);

  //gen a raw token
  const resetToken = cryptoUtils.generateRawToken();
  // Hash token
  const resetTokenHash = await cryptoUtils.generateTokenHash(resetToken);
  //expires in
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  //Store the token generated
  await passwordResetTokenRepository.create({
    tokenHash: resetTokenHash,
    userId: safeUser.id,
    expiresAt,
  });


 //A service to send the email
  return emailService({
    receiver: safeUser.email,
    resetToken
  });
};

export const resetPassword = async ({ rawToken, newPassword }) => {
  const rawTokenHash = await cryptoUtils.generateTokenHash(rawToken);
  const existingResetToken =
    await passwordResetTokenRepository.findByHash(rawTokenHash);

  if (
    !existingResetToken ||
    existingResetToken.used ||
    existingResetToken.expiresAt < new Date()
  ) {
    throw new AuthError.UnauthorizedError(
      " Invalid or expired password reset token",
    );
  }

  //Update user password and mark token as used
  const newPasswordHash = await hashPassword(newPassword);
  await userRepository.updatePassword({
    userId: existingResetToken.userId,
    newPasswordHash,
  });
  await passwordResetTokenRepository.markUsed(rawTokenHash);

  //Revoke all tokens after user resets password
  await revokeAllTokensForUser(existingResetToken.userId);
};
