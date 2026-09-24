import { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { DATABASE_URL } from "./config.env.js";

const adapter = new PrismaPg({
  connectionString: DATABASE_URL,
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
    console.log("DB disconnected");
  } catch (err) {
    throw new Error("DB disconnection Failed");
  }
};
