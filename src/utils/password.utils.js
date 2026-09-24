import bcrypt from "bcrypt";
import * as ConfigEnv from "../config/config.env.js";

const SALT_ROUNDS = ConfigEnv.SALT_ROUNDS

export const hashPassword = async (plainTextPassword) => {
  return await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
};

export const comparePassword = async (plainTextPassword, hashedPassword) => {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};
