import { prisma } from "../config/db.js";

export const createRefreshToken = async ({
  tokenHash,
  userId,
  familyId,
  expiresAt,
  replacedBy,
}) => {
  return await prisma.refreshToken.create({
    data: { tokenHash, userId, familyId, expiresAt, replacedBy },
  });
};

export const findByHash = async (tokenHash) => {
  return await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });
};

export const revokeFamily = async (familyId) => {
  return await prisma.refreshToken.updateMany({
    where: { familyId },
    data: { revoked: true },
  });
};

export const markRotated = async (tokenHash, newTokenHash) => {
  return await prisma.refreshToken.update({
    where: { tokenHash },
    data: {
      revoked: true,
      replacedBy: newTokenHash,
    },
  });
};

export const revokeByHash = async (tokenHash) => {
  return await prisma.refreshToken.update({
    where: {
      tokenHash,
    },
    data: {
      revoked: true,
    },
  });
};

export const revokeAllTokensForUser = async (userId) => {
  return await prisma.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  });
};
