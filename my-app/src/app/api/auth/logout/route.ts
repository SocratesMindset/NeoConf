import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import {
  clearSessionCookie,
  deleteSessionByRequest,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    await deleteSessionByRequest(request);
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
