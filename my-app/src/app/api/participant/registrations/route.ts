import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { serializeParticipantRegistration } from "@/lib/serializers";
import { participantRegistrationSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request, ["PARTICIPANT"]);
    const payload = participantRegistrationSchema.parse(await request.json());

    const conference = await prisma.conference.findUnique({
      where: {
        id: payload.conferenceId,
      },
    });

    if (!conference) {
      throw new ApiError(404, "Выбранная конференция не найдена.");
    }

    const registration = await prisma.conferenceRegistration.create({
      data: {
        conferenceId: payload.conferenceId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return jsonResponse(serializeParticipantRegistration(registration), {
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
        new ApiError(409, "Вы уже зарегистрированы на эту конференцию."),
      );
    }

    return handleApiError(error);
  }
}
