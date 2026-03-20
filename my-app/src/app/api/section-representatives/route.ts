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

    const representative = await prisma.sectionRepresentative.upsert({
      where: {
        conferenceId_sectionName: {
          conferenceId: payload.conferenceId,
          sectionName: payload.sectionName.trim(),
        },
      },
      update: {
        representativeName: payload.representativeName.trim(),
        representativeEmail: normalizeEmail(payload.representativeEmail),
        createdAt: new Date(),
      },
      create: {
        conferenceId: payload.conferenceId,
        sectionName: payload.sectionName.trim(),
        representativeName: payload.representativeName.trim(),
        representativeEmail: normalizeEmail(payload.representativeEmail),
      },
    });

    return jsonResponse(serializeSectionRepresentative(representative), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
