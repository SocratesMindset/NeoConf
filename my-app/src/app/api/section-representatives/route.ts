import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/roles";
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

    const registration = await prisma.conferenceRegistration.findUnique({
      where: {
        conferenceId_userId: {
          conferenceId: payload.conferenceId,
          userId: payload.representativeUserId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            roles: true,
          },
        },
      },
    });

    if (!registration) {
      throw new ApiError(
        404,
        "Председатель секции должен быть зарегистрирован на выбранную конференцию.",
      );
    }

    const representative = await prisma.sectionRepresentative.upsert({
      where: {
        conferenceId_sectionName: {
          conferenceId: payload.conferenceId,
          sectionName: payload.sectionName.trim(),
        },
      },
      update: {
        representativeUserId: registration.user.id,
        representativeName: registration.user.fullName,
        representativeEmail: normalizeEmail(registration.user.email),
        createdAt: new Date(),
      },
      create: {
        conferenceId: payload.conferenceId,
        sectionName: payload.sectionName.trim(),
        representativeUserId: registration.user.id,
        representativeName: registration.user.fullName,
        representativeEmail: normalizeEmail(registration.user.email),
      },
    });

    return jsonResponse(serializeSectionRepresentative(representative), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
