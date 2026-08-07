import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { appRoleToDbRole } from "@/lib/roles";
import { serializeUser } from "@/lib/serializers";
import type { AppRole } from "@/types/domain";

const QUERYABLE_ROLES = ["section-chair", "reviewer"] as const;

export async function GET(request: NextRequest) {
  try {
    const roleParam = new URL(request.url).searchParams.get("role");

    if (
      !roleParam ||
      !(QUERYABLE_ROLES as readonly string[]).includes(roleParam)
    ) {
      throw new ApiError(400, "Укажите корректную роль.");
    }

    const targetRole = roleParam as AppRole;

    if (targetRole === "reviewer") {
      await requireUser(request, ["ADMIN", "SECTION_CHAIR"]);
    } else {
      await requireUser(request, ["ADMIN"]);
    }

    const dbRole = appRoleToDbRole(targetRole);
    const users = await prisma.user.findMany({
      where: { roles: { has: dbRole } },
      orderBy: { fullName: "asc" },
    });

    return jsonResponse(users.map(serializeUser));
  } catch (error) {
    return handleApiError(error);
  }
}
