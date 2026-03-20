import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/roles";
import { serializeUser } from "@/lib/serializers";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = loginSchema.parse(await request.json());
    const email = normalizeEmail(payload.email);
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ApiError(401, "Неверный email или пароль.");
    }

    const isValidPassword = await verifyPassword(payload.password, user.passwordHash);
    if (!isValidPassword) {
      throw new ApiError(401, "Неверный email или пароль.");
    }

    const session = await createSession(user.id);
    const response = NextResponse.json({
      user: serializeUser(user),
    });

    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
