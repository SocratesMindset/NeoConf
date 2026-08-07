import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { serializeSection } from "@/lib/serializers";
import { createSectionSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ["ADMIN"]);
    const payload = createSectionSchema.parse(await request.json());

    const conference = await prisma.conference.findUnique({
      where: { id: payload.conferenceId },
    });

    if (!conference) {
      throw new ApiError(404, "Выбранная конференция не найдена.");
    }

    const existingSection = await prisma.section.findUnique({
      where: {
        conferenceId_name: {
          conferenceId: payload.conferenceId,
          name: payload.name.trim(),
        },
      },
    });

    if (existingSection) {
      throw new ApiError(409, "Такая секция уже есть на этой конференции.");
    }

    const section = await prisma.section.create({
      data: {
        conferenceId: payload.conferenceId,
        name: payload.name.trim(),
      },
    });

    return jsonResponse(serializeSection(section), { status: 201 });
  } catch (error) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : null;

    if (code === "P2002") {
      return handleApiError(
        new ApiError(409, "Такая секция уже есть на этой конференции."),
      );
    }

    return handleApiError(error);
  }
}
