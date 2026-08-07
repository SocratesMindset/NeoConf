import type { NextRequest } from "next/server";
import { jsonResponse, handleApiError } from "@/lib/api";
import { getAppState, toPublicAppState } from "@/lib/app-state";
import { getSessionUser } from "@/lib/auth/session";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    enforceRateLimit(
      `app-state:${user ? user.id : getClientIp(request)}`,
      30,
      60 * 1000,
    );

    const state = await getAppState();
    return jsonResponse(user ? state : toPublicAppState(state));
  } catch (error) {
    return handleApiError(error);
  }
}
