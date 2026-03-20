import { jsonResponse, handleApiError } from "@/lib/api";
import { getAppState } from "@/lib/app-state";

export async function GET() {
  try {
    const state = await getAppState();
    return jsonResponse(state);
  } catch (error) {
    return handleApiError(error);
  }
}
