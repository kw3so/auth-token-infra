import { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.LOCAL_DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB connected via prisma");
  } catch (err) {
    throw new Error("DB connection Failed");
  }
};
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("DB connected");
  } catch (err) {
    throw new Error("DB disconnection Failed");
  }
};
