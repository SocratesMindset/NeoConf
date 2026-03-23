import { promises as fs } from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { ApiError, handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { getStoredFilePath } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, resolveDbRoles } from "@/lib/roles";

type Context = {
  params: Promise<{
    articleId: string;
  }>;
};

export async function GET(request: NextRequest, context: Context) {
  try {
    const user = await requireUser(request);
    const { articleId } = await context.params;
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
      },
      select: {
        id: true,
        conferenceId: true,
        sectionName: true,
        authorId: true,
        originalFileName: true,
        storageKey: true,
        mimeType: true,
      },
    });

    if (!article) {
      throw new ApiError(404, "Статья не найдена.");
    }

    const normalizedEmail = normalizeEmail(user.email);
    const userRoles = resolveDbRoles(user);
    let canDownload =
      article.authorId === user.id || userRoles.includes("ADMIN");

    if (!canDownload) {
      const [reviewerAssignment, representativeAccess] = await Promise.all([
        prisma.reviewerAssignment.findFirst({
          where: {
            articleId: article.id,
            OR: [
              { reviewerUserId: user.id },
              { reviewerEmail: normalizedEmail },
            ],
          },
          select: {
            id: true,
          },
        }),
        prisma.sectionRepresentative.findFirst({
          where: {
            conferenceId: article.conferenceId,
            sectionName: article.sectionName,
            OR: [
              { representativeUserId: user.id },
              { representativeEmail: normalizedEmail },
            ],
          },
          select: {
            id: true,
          },
        }),
      ]);

      canDownload = Boolean(reviewerAssignment || representativeAccess);
    }

    if (!canDownload) {
      throw new ApiError(403, "Недостаточно прав для скачивания этой статьи.");
    }

    const filePath = getStoredFilePath(article.storageKey);
    const fileBuffer = await fs.readFile(filePath);

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": article.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          path.basename(article.originalFileName),
        )}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
