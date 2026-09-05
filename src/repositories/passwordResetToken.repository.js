import prisma from "../config/db.js";

export const create = async ({ tokenHash, userId, expiresAt }) => {
  return await prisma.passwordResetToken.create({
    data: { tokenHash, userId, expiresAt },
  });
};

export const findByHash = async (tokenHash) => {
  return await prisma.passwordResetToken.findUnique({
    where: tokenHash,
  });
};

export const markUsed = async (tokenHash) => {
  return await prisma.passwordResetToken.update({
    where: { tokenHash },
    data: { used: true },
  });
};

export const invalidateAllForUser = async (userId) => {
  return await prisma.passwordResetToken.updateMany({
    where: { userId: userId, used: false },
    data: { used: true },
  });
};
