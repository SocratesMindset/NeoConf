import type { NextRequest } from "next/server";
import { handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  try {
    await requireUser(request, ["SUPERADMIN"]);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return jsonResponse(users.map(serializeUser));
  } catch (error) {
    return handleApiError(error);
  }
}
