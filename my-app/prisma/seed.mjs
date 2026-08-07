import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function ensureSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD не заданы — пропускаю bootstrap суперадминистратора.",
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const roles = Array.from(new Set([...existing.roles, "SUPERADMIN"]));
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "SUPERADMIN", roles },
    });
    return;
  }

  await prisma.user.create({
    data: {
      fullName: "Суперадминистратор",
      email,
      role: "SUPERADMIN",
      roles: ["SUPERADMIN"],
      passwordHash: await hashPassword(password),
    },
  });
}

async function main() {
  await ensureSuperAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
