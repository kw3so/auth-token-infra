import { prisma } from "../config/db.js";

export const createRefreshToken = async ({
  tokenHash,
  userId,
  familyId,
  expiresAt,
}) => {
  return await prisma.refreshToken.create({
    data: { tokenHash, userId, familyId, expiresAt },
  });
};