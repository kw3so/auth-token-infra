import jwt from "jsonwebtoken";
import {
  createRefreshToken,
  findByHash,
  markRotated,
  revokeAllTokensForUser,
  revokeByHash,
  revokeFamily,
} from "../repositories/refreshtoken.repository.js";
import {
  generateRandomUUID,
  generateRawToken,
  generateTokenHash,
} from "../utils/crypto.utils.js";

import { ForbiddenError, UnauthorizedError } from "../errors/auth.errors.js";
import * as ConfigEnv from "../config/config.env.js";

export const generateAccessToken = ({ userId, username }) => {
  const ACCESS_TOKEN_TTL_SEC = ConfigEnv.ACCESS_TOKEN_TTL_MINUTES * 60;

  //Access token
  const accessToken = jwt.sign(
    { sub: userId, name: username },
    ConfigEnv.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL_SEC },
  );

  return accessToken;
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ConfigEnv.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired access token");
  }
};

export const issueRefreshToken = async (userId) => {
  const REFRESH_TOKEN_TTL_MS =
    ConfigEnv.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  //Token is a random string
  const rawToken = generateRawToken();

  //Create a Hash, peppered to store in the db
  const rawTokenHash = generateTokenHash(rawToken);
  //This is called only once during the auth session. Grouping purpose
  const familyId = generateRandomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  //Store the token in db
  await createRefreshToken({
    tokenHash: rawTokenHash,
    userId,
    familyId,
    expiresAt,
  });

  return rawToken;
};

export const rotateRefreshToken = async (rawToken) => {
  //env variables
  const REFRESH_TOKEN_TTL_MS =
    ConfigEnv.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

  //Get the token hash that's stored with the salt
  const rawTokenHash = generateTokenHash(rawToken);
  //Get the rawtoken in the db
  const existingTokenHash = await findByHash(rawTokenHash);
  //Check if it is not existing
  if (!existingTokenHash) {
    throw new UnauthorizedError("Invalid refresh token");
  }
  //Expired
  if (existingTokenHash.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token expired");
  }
  //Check if it is marked as revoked
  if (existingTokenHash.revoked) {
    await revokeFamily(existingTokenHash.familyId);
    throw new ForbiddenError(
      "Refresh token reuse detected - all sessions revoked",
    );
  }
  //Write a new refresh token Hash
  const newRawToken = generateRawToken();
  //Hash the new raw token
  const newRawTokenHash = generateTokenHash(newRawToken);
  // Create a new expiry
  const newExpiryAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  //Store the new token hash
  await createRefreshToken({
    tokenHash: newRawTokenHash,
    userId: existingTokenHash.userId,
    familyId: existingTokenHash.familyId,
    expiresAt: newExpiryAt,
    replacedBy: rawTokenHash,
  });

  //Update the revoked and replacedBy values in the DB to show that they have been swapped and updated
  await markRotated(rawTokenHash, newRawTokenHash);
  //return the newToken and userId attached to it
  return { rawToken: newRawToken, userId: existingTokenHash.userId };
};

export const revokeRefreshToken = async (rawToken) => {
  //Logout

  const rawTokenHash = generateTokenHash(rawToken);

  const existingTokenHash = await findByHash(rawTokenHash);

  if (existingTokenHash) {
    await revokeByHash(rawTokenHash);
  }
};

//logout everywhere, all devices
//Best case - reset password flow
export const revokeAllUserTokens = async (userId) => {
  await revokeAllTokensForUser(userId);
};
