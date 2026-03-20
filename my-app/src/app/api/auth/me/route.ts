import type { NextRequest } from "next/server";
import { jsonResponse, handleApiError } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { serializeUser } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    return jsonResponse({
      user: user ? serializeUser(user) : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
