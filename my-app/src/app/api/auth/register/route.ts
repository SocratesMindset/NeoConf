import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { appRolesToDbRoles, normalizeEmail } from "@/lib/roles";
import { serializeUser } from "@/lib/serializers";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(
      `register:${getClientIp(request)}`,
      5,
      60 * 60 * 1000,
      "Слишком много регистраций с вашего адреса. Попробуйте позже.",
    );

    const payload = registerSchema.parse(await request.json());
    const email = normalizeEmail(payload.email);
    const roles = appRolesToDbRoles(payload.roles);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ApiError(409, "Пользователь с таким email уже существует.");
    }

    const user = await prisma.user.create({
      data: {
        fullName: payload.fullName.trim(),
        email,
        role: roles[0],
        roles,
        passwordHash: await hashPassword(payload.password),
      },
    });

    const session = await createSession(user.id);
    const response = NextResponse.json(
      {
        user: serializeUser(user),
      },
      { status: 201 },
    );

    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
