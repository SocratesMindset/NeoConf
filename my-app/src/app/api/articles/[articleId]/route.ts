import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { deleteStoredFile } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { resolveDbRoles } from "@/lib/roles";

type Context = {
  params: Promise<{
    articleId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const user = await requireUser(request);
    const { articleId } = await context.params;

    enforceRateLimit(`article-delete:${user.id}`, 20, 60 * 60 * 1000);

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, authorId: true, storageKey: true },
    });

    if (!article) {
      throw new ApiError(404, "Статья не найдена.");
    }

    const userRoles = resolveDbRoles(user);
    const isOwner = article.authorId === user.id;
    const isModerator =
      userRoles.includes("ADMIN") || userRoles.includes("SUPERADMIN");

    if (!isOwner && !isModerator) {
      throw new ApiError(403, "Недостаточно прав для удаления этой статьи.");
    }

    const [assignmentCount, reviewCount] = await Promise.all([
      prisma.reviewerAssignment.count({ where: { articleId } }),
      prisma.review.count({ where: { articleId } }),
    ]);

    if (assignmentCount > 0 || reviewCount > 0) {
      throw new ApiError(
        409,
        "Нельзя удалить статью: по ней уже есть назначенные рецензенты или рецензии.",
      );
    }

    await prisma.article.delete({ where: { id: articleId } });
    await deleteStoredFile(article.storageKey);

    return jsonResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
