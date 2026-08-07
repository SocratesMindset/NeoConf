import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    representativeId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: Context) {
  try {
    await requireUser(request, ["ADMIN"]);
    const { representativeId } = await context.params;

    const representative = await prisma.sectionRepresentative.findUnique({
      where: { id: representativeId },
      select: { id: true },
    });

    if (!representative) {
      throw new ApiError(404, "Назначение не найдено.");
    }

    await prisma.sectionRepresentative.delete({
      where: { id: representativeId },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
