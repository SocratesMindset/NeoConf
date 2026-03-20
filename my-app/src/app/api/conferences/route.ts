import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { serializeConference } from "@/lib/serializers";
import { createConferenceSchema } from "@/lib/validators";

export async function GET() {
  try {
    const conferences = await prisma.conference.findMany({
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    });
    return jsonResponse(conferences.map(serializeConference));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ["ADMIN"]);
    const payload = createConferenceSchema.parse(await request.json());

    const existingConference = await prisma.conference.findFirst({
      where: {
        name: payload.name.trim(),
        startDate: new Date(payload.startDate),
      },
    });

    if (existingConference) {
      throw new ApiError(
        409,
        "Конференция с таким названием и датой уже существует.",
      );
    }

    const conference = await prisma.conference.create({
      data: {
        name: payload.name.trim(),
        city: payload.city.trim(),
        startDate: new Date(payload.startDate),
      },
    });

    return jsonResponse(serializeConference(conference), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
