import { promises as fs } from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { ApiError, handleApiError } from "@/lib/api";
import { getStoredFilePath } from "@/lib/files";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    articleId: string;
  }>;
};

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { articleId } = await context.params;
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
      },
      select: {
        originalFileName: true,
        storageKey: true,
        mimeType: true,
      },
    });

    if (!article) {
      throw new ApiError(404, "Статья не найдена.");
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
