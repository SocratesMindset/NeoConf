import type { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/roles";
import { reviewerAssignmentSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const payload = reviewerAssignmentSchema.parse(await request.json());
    const articleIds = Array.from(new Set(payload.articleIds));

    const articles = await prisma.article.findMany({
      where: {
        id: {
          in: articleIds,
        },
      },
      select: {
        id: true,
        conferenceId: true,
        sectionName: true,
      },
    });

    if (articles.length !== articleIds.length) {
      throw new ApiError(
        404,
        "Одна или несколько выбранных статей не найдены.",
      );
    }

    const accessList = await prisma.sectionRepresentative.findMany({
      where: {
        OR: [
          { representativeUserId: user.id },
          { representativeEmail: normalizeEmail(user.email) },
        ],
      },
      select: {
        conferenceId: true,
        sectionName: true,
      },
    });

    const hasAccessToAllArticles = articles.every((article) =>
      accessList.some(
        (access) =>
          access.conferenceId === article.conferenceId &&
          access.sectionName === article.sectionName,
      ),
    );

    if (!hasAccessToAllArticles) {
      throw new ApiError(
        403,
        "Вы можете назначать рецензентов только для своей секции.",
      );
    }

    const conferenceIds = Array.from(
      new Set(articles.map((article) => article.conferenceId)),
    );
    const registrations = await prisma.conferenceRegistration.findMany({
      where: {
        userId: payload.reviewerUserId,
        conferenceId: {
          in: conferenceIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            roles: true,
          },
        },
      },
    });

    if (registrations.length !== conferenceIds.length) {
      throw new ApiError(
        404,
        "Рецензент должен быть зарегистрирован на всех выбранных конференциях.",
      );
    }

    const reviewer = registrations[0]?.user;

    if (!reviewer) {
      throw new ApiError(404, "Выбранный рецензент не найден.");
    }

    const existingAssignments = await prisma.reviewerAssignment.findMany({
      where: {
        articleId: {
          in: articleIds,
        },
        OR: [
          {
            reviewerUserId: reviewer.id,
          },
          {
            reviewerEmail: normalizeEmail(reviewer.email),
          },
        ],
      },
      select: {
        articleId: true,
      },
    });

    if (existingAssignments.length) {
      throw new ApiError(
        409,
        "Этот рецензент уже назначен на одну или несколько выбранных статей.",
      );
    }

    await prisma.$transaction(
      articles.map((article) =>
        prisma.reviewerAssignment.create({
          data: {
            articleId: article.id,
            reviewerUserId: reviewer.id,
            reviewerName: reviewer.fullName,
            reviewerEmail: normalizeEmail(reviewer.email),
            assignedBy: user.fullName,
          },
        }),
      ),
    );

    return jsonResponse(
      {
        createdCount: articles.length,
      },
      {
        status: 201,
      },
    );
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
        new ApiError(
          409,
          "Этот рецензент уже назначен на одну или несколько выбранных статей.",
        ),
      );
    }

    return handleApiError(error);
  }
}
