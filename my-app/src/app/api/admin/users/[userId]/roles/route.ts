import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { appRolesToDbRoles } from "@/lib/roles";
import { serializeUser } from "@/lib/serializers";
import { updateUserRolesSchema } from "@/lib/validators";

type Context = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const actor = await requireUser(request, ["SUPERADMIN"]);
    const { userId } = await context.params;
    const payload = updateUserRolesSchema.parse(await request.json());
    const roles = appRolesToDbRoles(payload.roles);

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new ApiError(404, "Пользователь не найден.");
    }

    if (targetUser.id === actor.id && !roles.includes("SUPERADMIN")) {
      throw new ApiError(
        400,
        "Нельзя снять с себя роль суперадминистратора. Попросите другого суперадминистратора изменить ваши права.",
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: roles[0],
        roles,
      },
    });

    return jsonResponse(serializeUser(updatedUser));
  } catch (error) {
    return handleApiError(error);
  }
}
