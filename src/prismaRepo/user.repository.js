import { prisma } from "../config/db.js";

export const findByEmailOrName = async (username, email) => {
  return await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
    select: {
      id: true,
      phoneNumber: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });
};

export const createUser = async ({
  username,
  phoneNumber,
  email,
  password,
}) => {
  return await prisma.user.create({
    data: {
      username,
      phoneNumber,
      email,
      password,
    },
    select: {
      id: true,
      phoneNumber: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });
};
