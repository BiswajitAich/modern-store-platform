import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { hash } from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  adapter,
});

export async function main() {
  const password_hash = await hash("12345", 10);

  const adminData: Prisma.AdminCreateInput[] = [
    {
      adminId: "1",
      storeSlug: "aich",
      email: "admin@gmail.com",
      phoneNumber: "admin@gmail.com",
      firstName: "hello_admin",
      lastName: "world_admin",
      passwordHash: password_hash,
    },
  ];
  // const userData: Prisma.UserCreateInput[] = [
  //   {
  //     userId: "2",
  //     email: "user2@gmail.com",
  //     firstName: "hello_user2",
  //     lastName: "world_user2",
  //     passwordHash: password_hash,
  //   },
  // ];
  for (const u of adminData) {
    await prisma.admin.create({ data: u });
  }
  // for (const u of userData) {
  //   await prisma.user.create({ data: u });
  // }
}

main();
