import crypto from "crypto";
import * as AuthError from "../errors/auth.errors.js"

export const generateRawToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const generateTokenHash = (rawToken) => {
  const pepper = process.env.REFRESH_TOKEN_PEPPER;
  if (!rawToken) {
    throw new AuthError.ValidationError("Not authenticated")
  }
  return crypto.createHmac("sha256", pepper).update(rawToken).digest("hex");
};

export const generateRandomUUID = () => {
  return crypto.randomUUID();
};
