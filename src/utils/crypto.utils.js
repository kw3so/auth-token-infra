import crypto from "crypto";
import * as AuthError from "../errors/auth.errors.js"
import { REFRESH_TOKEN_PEPPER } from "../config/config.env.js";

export const generateRawToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const generateTokenHash = (rawToken) => {
  const pepper = REFRESH_TOKEN_PEPPER
  // if (!rawToken) {
  //   throw new AuthError.ValidationError("No token present")
  // }
  return crypto.createHmac("sha256", pepper).update(rawToken).digest("hex");
};

export const generateRandomUUID = () => {
  return crypto.randomUUID();
};
