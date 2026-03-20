import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/roles";
import { serializeReviewerAssignment } from "@/lib/serializers";
import { reviewerAssignmentSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request, ["SECTION_CHAIR"]);
    const payload = reviewerAssignmentSchema.parse(await request.json());

    const article = await prisma.article.findUnique({
      where: {
        id: payload.articleId,
      },
      select: {
        id: true,
        conferenceId: true,
        sectionName: true,
      },
    });

    if (!article) {
      throw new ApiError(404, "Выбранная статья не найдена.");
    }

    const access = await prisma.sectionRepresentative.findFirst({
      where: {
        conferenceId: article.conferenceId,
        sectionName: article.sectionName,
        representativeEmail: normalizeEmail(user.email),
      },
    });

    if (!access) {
      throw new ApiError(
        403,
        "Вы можете назначать рецензентов только для своей секции.",
      );
    }

    const assignment = await prisma.reviewerAssignment.create({
      data: {
        articleId: payload.articleId,
        reviewerName: payload.reviewerName.trim(),
        reviewerEmail: normalizeEmail(payload.reviewerEmail),
        assignedBy: user.fullName,
      },
    });

    return jsonResponse(serializeReviewerAssignment(assignment), {
      status: 201,
    });
  } catch (error) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : null;

    if (code === "P2002") {
      return handleApiError(
        new ApiError(409, "Этот рецензент уже назначен на выбранную статью."),
      );
    }

    return handleApiError(error);
  }
}
