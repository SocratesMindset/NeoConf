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

const defaultSections = [
  {
    sectionName: "Искусственный интеллект",
    representativeName: "Будет назначен",
    representativeEmail: "chair-ai@example.com",
  },
  {
    sectionName: "Data Science",
    representativeName: "Будет назначен",
    representativeEmail: "chair-ds@example.com",
  },
  {
    sectionName: "Разработка ПО",
    representativeName: "Будет назначен",
    representativeEmail: "chair-dev@example.com",
  },
  {
    sectionName: "Кибербезопасность",
    representativeName: "Будет назначен",
    representativeEmail: "chair-sec@example.com",
  },
];

async function main() {
  const conference = await prisma.conference.upsert({
    where: {
      id: "seed-neoconf-2026",
    },
    update: {},
    create: {
      id: "seed-neoconf-2026",
      name: "NeoConf 2026",
      city: "Москва",
      startDate: new Date("2026-05-20T09:00:00.000Z"),
    },
  });

  for (const section of defaultSections) {
    await prisma.sectionRepresentative.upsert({
      where: {
        conferenceId_sectionName: {
          conferenceId: conference.id,
          sectionName: section.sectionName,
        },
      },
      update: {
        representativeName: section.representativeName,
        representativeEmail: section.representativeEmail,
      },
      create: {
        conferenceId: conference.id,
        sectionName: section.sectionName,
        representativeName: section.representativeName,
        representativeEmail: section.representativeEmail,
      },
    });
  }

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
