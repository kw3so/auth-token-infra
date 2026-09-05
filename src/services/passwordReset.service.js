import * as passwordResetTokenRepository from "../repositories/passwordResetToken.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as cryptoUtils from "../utils/crypto.utils.js";
import * as AuthError from "../errors/auth.errors.js";
import { revokeAllTokensForUser } from "../repositories/refreshtoken.repository.js";

export const requestPasswordReset = async (email) => {
  const passwordResetExpiresInMin = parseInt(
    process.env.PASSWORD_RESET_EXPIRES_IN_MINUTES,
    10,
  );
  const user = await userRepository.findByEmail(email);

  //Decision, we always respond as if request successful, no throw
  if (!user) {
    return;
  }

  //Invalidate all the resetTokens
  await passwordResetTokenRepository.invalidateAllForUser(user.id);

  //gen a raw token
  const rawToken = cryptoUtils.generateRawToken();
  // Hash token
  const rawTokenHash = await cryptoUtils.generateTokenHash(rawToken);
  //expires in
  const expiresAt = new Date(
    Date.now() + passwordResetExpiresInMin * 60 * 1000,
  );

  //Store the token generated
  await passwordResetTokenRepository.create({
    tokenHash: rawTokenHash,
    userId: user.id,
    expiresAt,
  });

  //setup the reset password email
  const resetUrl = `${process.env.appUrl}/reset-password?token=${rawToken}`;
  console.log(user.email, resetUrl); //A service to send the email
};

export const resetPassword = async ({ rawToken, newPassword }) => {
  const rawTokenHash = await cryptoUtils.generateTokenHash(rawToken);
  const existingRawToken =
    await passwordResetTokenRepository.findByHash(rawTokenHash);

  if (
    !existingRawToken ||
    existingRawToken.used ||
    existingRawToken.expiresAt < new Date()
  ) {
    throw new AuthError.UnauthorizedError(
      " Invalid or expired password reset token",
    );
  }

  //Update user password and mark token as used
  const newPasswordHash = await cryptoUtils.generateTokenHash(newPassword);
  await userRepository.updatePassword(existingRawToken.userId, newPasswordHash);
  await passwordResetTokenRepository.markUsed(rawTokenHash);

  //Revoke all tokens after user resets password
  await revokeAllTokensForUser(existingRawToken.userId);
};
