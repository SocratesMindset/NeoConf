import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ApiError } from "@/lib/api";
import { env } from "@/lib/env";

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

function getUploadRoot() {
  return path.join(process.cwd(), env.UPLOAD_DIR);
}

export async function ensureUploadRoot() {
  await fs.mkdir(getUploadRoot(), { recursive: true });
}

export async function saveArticleFile(file: File) {
  const originalFileName = file.name?.trim();
  if (!originalFileName) {
    throw new ApiError(400, "Файл статьи обязателен.");
  }

  const extension = path.extname(originalFileName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new ApiError(400, "Допустимы только файлы PDF, DOC и DOCX.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!buffer.length) {
    throw new ApiError(400, "Нельзя загрузить пустой файл.");
  }

  await ensureUploadRoot();

  const storageKey = `${Date.now()}-${randomUUID()}${extension}`;
  await fs.writeFile(path.join(getUploadRoot(), storageKey), buffer);

  return {
    storageKey,
    originalFileName,
    mimeType: file.type || "application/octet-stream",
    fileSizeBytes: buffer.length,
  };
}

export async function deleteStoredFile(storageKey: string) {
  try {
    await fs.unlink(path.join(getUploadRoot(), storageKey));
  } catch {
    // Ignore cleanup failures for missing files.
  }
}

export function getStoredFilePath(storageKey: string) {
  return path.join(getUploadRoot(), storageKey);
}
