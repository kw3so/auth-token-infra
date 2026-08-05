import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const hashPassword = async (plainTextPassword) => {
  return await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
};
