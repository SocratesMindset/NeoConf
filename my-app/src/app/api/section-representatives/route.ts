import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, resolveDbRoles } from "@/lib/roles";
import { serializeSectionRepresentative } from "@/lib/serializers";
import { sectionRepresentativeSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ["ADMIN"]);
    const payload = sectionRepresentativeSchema.parse(await request.json());

    const conference = await prisma.conference.findUnique({
      where: {
        id: payload.conferenceId,
      },
    });

    if (!conference) {
      throw new ApiError(404, "Выбранная конференция не найдена.");
    }

    const section = await prisma.section.findUnique({
      where: {
        conferenceId_name: {
          conferenceId: payload.conferenceId,
          name: payload.sectionName.trim(),
        },
      },
    });

    if (!section) {
      throw new ApiError(
        400,
        "Такой секции нет на конференции. Сначала создайте секцию.",
      );
    }

    const candidate = await prisma.user.findUnique({
      where: { id: payload.representativeUserId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        roles: true,
      },
    });

    if (!candidate) {
      throw new ApiError(404, "Выбранный пользователь не найден.");
    }

    if (!resolveDbRoles(candidate).includes("SECTION_CHAIR")) {
      throw new ApiError(
        400,
        "У выбранного пользователя нет роли председателя секции.",
      );
    }

    const representative = await prisma.sectionRepresentative.create({
      data: {
        conferenceId: payload.conferenceId,
        sectionName: payload.sectionName.trim(),
        representativeUserId: candidate.id,
        representativeName: candidate.fullName,
        representativeEmail: normalizeEmail(candidate.email),
      },
    });

    return jsonResponse(serializeSectionRepresentative(representative), {
      status: 201,
    });
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
        new ApiError(409, "Этот пользователь уже председатель этой секции."),
      );
    }

    return handleApiError(error);
  }
}
