import type { NextRequest } from "next/server";
import { jsonResponse, handleApiError } from "@/lib/api";
import { getAppState } from "@/lib/app-state";
import { requireUser } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    enforceRateLimit(`app-state:${user.id}`, 30, 60 * 1000);

    const state = await getAppState();
    return jsonResponse(state);
  } catch (error) {
    return handleApiError(error);
  }
}
