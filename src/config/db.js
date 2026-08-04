import { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionSting = process.env.LOCAL_DATABASE_URL;

const adapter = new PrismaPg(connectionSting);

export const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
  await prisma.$connect().catch((err) => {
    console.error("Failed to connect to DB", err);
  });
  console.log("DB connected");
};

export const disconnectDB = async () => {
  await prisma.$disconnect().catch((err)=>{
    console.error("Failed to disconnect from the DB")
  }
  );
  console.log("DB disconnected");
};
