import { prisma } from "../config/db.js";

export const findByEmailOrName = async (username, email) => {
  return await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
};
