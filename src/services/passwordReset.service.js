import * as passwordResetTokenRepository from "../repositories/passwordResetToken.repository";
import * as userRepository from "../repositories/user.repository";
import * as cryptoUtils from "../utils/crypto.utils";

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
  const rawTokenHash = cryptoUtils.generateTokenHash(rawToken);
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

export const resetPassword = async (rawToken, newPassword) => {};
