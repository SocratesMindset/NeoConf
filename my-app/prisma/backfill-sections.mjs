import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [articles, representatives] = await Promise.all([
    prisma.article.findMany({
      select: { conferenceId: true, sectionName: true },
      distinct: ["conferenceId", "sectionName"],
    }),
    prisma.sectionRepresentative.findMany({
      select: { conferenceId: true, sectionName: true },
      distinct: ["conferenceId", "sectionName"],
    }),
  ]);

  const pairs = new Map();
  for (const row of [...articles, ...representatives]) {
    const name = row.sectionName.trim();
    if (!name) continue;
    pairs.set(`${row.conferenceId}::${name}`, {
      conferenceId: row.conferenceId,
      name,
    });
  }

  let created = 0;
  for (const { conferenceId, name } of pairs.values()) {
    await prisma.section.upsert({
      where: { conferenceId_name: { conferenceId, name } },
      update: {},
      create: { conferenceId, name },
    });
    created += 1;
  }

  console.log(`Backfilled ${created} section(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
