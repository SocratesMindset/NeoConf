import type { AppState } from "@/types/domain";
import { prisma } from "@/lib/prisma";
import {
  serializeArticle,
  serializeConference,
  serializeParticipantRegistration,
  serializeReview,
  serializeReviewerAssignment,
  serializeSectionRepresentative,
} from "@/lib/serializers";

export async function getAppState(): Promise<AppState> {
  const [
    conferences,
    participantRegistrations,
    articles,
    reviewerAssignments,
    reviews,
    sectionRepresentatives,
  ] = await prisma.$transaction([
    prisma.conference.findMany({
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.conferenceRegistration.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.article.findMany({
      include: {
        author: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.reviewerAssignment.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.review.findMany({
      include: {
        reviewer: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.sectionRepresentative.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    conferences: conferences.map(serializeConference),
    participantRegistrations: participantRegistrations.map(
      serializeParticipantRegistration,
    ),
    articles: articles.map(serializeArticle),
    reviewerAssignments: reviewerAssignments.map(serializeReviewerAssignment),
    reviews: reviews.map(serializeReview),
    sectionRepresentatives: sectionRepresentatives.map(
      serializeSectionRepresentative,
    ),
  };
}
