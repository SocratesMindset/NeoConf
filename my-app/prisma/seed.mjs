import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
