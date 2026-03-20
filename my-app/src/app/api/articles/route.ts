import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { deleteStoredFile, saveArticleFile } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { serializeArticle } from "@/lib/serializers";

export async function POST(request: NextRequest) {
  let savedFile: Awaited<ReturnType<typeof saveArticleFile>> | null = null;

  try {
    const user = await requireUser(request, ["PARTICIPANT"]);
    const formData = await request.formData();
    const conferenceId = String(formData.get("conferenceId") ?? "").trim();
    const sectionName = String(formData.get("sectionName") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const abstract = String(formData.get("abstract") ?? "").trim();
    const file = formData.get("file");

    if (!conferenceId) {
      throw new ApiError(400, "Выберите конференцию.");
    }

    if (!sectionName) {
      throw new ApiError(400, "Выберите секцию.");
    }

    if (!title) {
      throw new ApiError(400, "Название статьи обязательно.");
    }

    if (!abstract) {
      throw new ApiError(400, "Аннотация обязательна.");
    }

    if (!(file instanceof File)) {
      throw new ApiError(400, "Файл статьи обязателен.");
    }

    const conference = await prisma.conference.findUnique({
      where: {
        id: conferenceId,
      },
    });

    if (!conference) {
      throw new ApiError(404, "Выбранная конференция не найдена.");
    }

    savedFile = await saveArticleFile(file);

    const article = await prisma.article.create({
      data: {
        conferenceId,
        sectionName,
        title,
        abstract,
        authorId: user.id,
        originalFileName: savedFile.originalFileName,
        storageKey: savedFile.storageKey,
        mimeType: savedFile.mimeType,
        fileSizeBytes: savedFile.fileSizeBytes,
      },
      include: {
        author: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return jsonResponse(serializeArticle(article), { status: 201 });
  } catch (error) {
    if (savedFile) {
      await deleteStoredFile(savedFile.storageKey);
    }
    return handleApiError(error);
  }
}
