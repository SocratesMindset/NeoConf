import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// Single-process, in-memory limiter. Good enough for a single `next start`
// instance behind nginx; won't share state across multiple app instances.
function hit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size > 50_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(bucketKey);
      }
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  message = "Слишком много запросов. Попробуйте позже.",
) {
  if (!hit(key, limit, windowMs)) {
    throw new ApiError(429, message);
  }
}
