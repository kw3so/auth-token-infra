import crypto from "crypto";

export const generateRawToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const generateTokenHash = (rawToken) => {
  const pepper = process.env.REFRESH_TOKEN_PEPPER;

  return crypto.createHmac("sha256", pepper).update(rawToken).digest("hex");
};

export const generateRandomUUID = () => {
  return crypto.randomUUID();
};
