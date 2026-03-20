import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/roles";
import { serializeReview } from "@/lib/serializers";
import { reviewSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request, ["REVIEWER"]);
    const payload = reviewSchema.parse(await request.json());

    const assignment = await prisma.reviewerAssignment.findFirst({
      where: {
        articleId: payload.articleId,
        reviewerEmail: normalizeEmail(user.email),
      },
    });

    if (!assignment) {
      throw new ApiError(
        403,
        "Рецензент не назначен на эту статью председателем секции.",
      );
    }

    const review = await prisma.review.upsert({
      where: {
        articleId_reviewerId: {
          articleId: payload.articleId,
          reviewerId: user.id,
        },
      },
      update: {
        score: payload.score,
        comment: payload.comment.trim(),
      },
      create: {
        articleId: payload.articleId,
        reviewerId: user.id,
        score: payload.score,
        comment: payload.comment.trim(),
      },
      include: {
        reviewer: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return jsonResponse(serializeReview(review), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
