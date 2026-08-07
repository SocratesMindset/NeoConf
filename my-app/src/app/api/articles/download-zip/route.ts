import { promises as fs } from "node:fs";
import { ZipArchive } from "archiver";
import type { NextRequest } from "next/server";
import { ApiError, handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { getStoredFilePath } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { normalizeEmail, resolveDbRoles } from "@/lib/roles";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get("conferenceId")?.trim();
    const sectionName = searchParams.get("sectionName")?.trim() || null;

    if (!conferenceId) {
      throw new ApiError(400, "Укажите конференцию.");
    }

    enforceRateLimit(
      `article-zip:${user.id}`,
      5,
      10 * 60 * 1000,
      "Слишком много запросов на скачивание архива. Попробуйте позже.",
    );

    const userRoles = resolveDbRoles(user);
    const isModerator =
      userRoles.includes("ADMIN") || userRoles.includes("SUPERADMIN");

    if (sectionName) {
      if (!isModerator) {
        const representative = await prisma.sectionRepresentative.findFirst({
          where: {
            conferenceId,
            sectionName,
            OR: [
              { representativeUserId: user.id },
              { representativeEmail: normalizeEmail(user.email) },
            ],
          },
          select: { id: true },
        });

        if (!representative) {
          throw new ApiError(
            403,
            "Вы не председатель этой секции на этой конференции.",
          );
        }
      }
    } else if (!isModerator) {
      throw new ApiError(
        403,
        "Скачивание всех статей конференции доступно только администратору.",
      );
    }

    const articles = await prisma.article.findMany({
      where: {
        conferenceId,
        ...(sectionName ? { sectionName } : {}),
      },
      select: {
        storageKey: true,
        originalFileName: true,
      },
    });

    if (!articles.length) {
      throw new ApiError(404, "По выбранным параметрам нет статей.");
    }

    const archive = new ZipArchive({ zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    const archiveDone = new Promise<Buffer>((resolve, reject) => {
      archive.on("data", (chunk: Buffer) => chunks.push(chunk));
      archive.on("end", () => resolve(Buffer.concat(chunks)));
      archive.on("error", reject);
    });

    const usedNames = new Set<string>();
    for (const article of articles) {
      let entryName = article.originalFileName || article.storageKey;
      let attempt = 1;
      while (usedNames.has(entryName)) {
        const dotIndex = entryName.lastIndexOf(".");
        const base =
          dotIndex > 0
            ? entryName.slice(0, dotIndex)
            : article.originalFileName || article.storageKey;
        const extension = dotIndex > 0 ? entryName.slice(dotIndex) : "";
        entryName = `${base} (${attempt})${extension}`;
        attempt += 1;
      }
      usedNames.add(entryName);

      try {
        const buffer = await fs.readFile(getStoredFilePath(article.storageKey));
        archive.append(buffer, { name: entryName });
      } catch {}
    }

    await archive.finalize();
    const zipBuffer = await archiveDone;

    const filenameBase = sectionName
      ? `${conferenceId}-${sectionName}`
      : conferenceId;

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filenameBase)}.zip"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
