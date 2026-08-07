import type { AppState } from "@/types/domain";
import { prisma } from "@/lib/prisma";
import {
  serializeArticle,
  serializeConference,
  serializeParticipantRegistration,
  serializeReview,
  serializeReviewerAssignment,
  serializeSection,
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
    sections,
  ] = await prisma.$transaction([
    prisma.conference.findMany({
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.conferenceRegistration.findMany({
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
    prisma.section.findMany({
      orderBy: {
        createdAt: "asc",
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
    sections: sections.map(serializeSection),
  };
}

export function toPublicAppState(state: AppState): AppState {
  return {
    conferences: state.conferences,
    participantRegistrations: state.participantRegistrations.map((registration) => ({
      ...registration,
      userId: "",
      userRoles: [],
      participantName: "",
      participantEmail: "",
    })),
    articles: state.articles.map((article) => ({
      ...article,
      title: "",
      abstract: "",
      authorName: "",
      authorEmail: "",
      fileName: "",
      fileDownloadUrl: "",
    })),
    reviewerAssignments: [],
    reviews: state.reviews.map((review) => ({
      ...review,
      reviewerName: "",
      reviewerEmail: "",
      comment: "",
    })),
    sectionRepresentatives: [],
    sections: state.sections,
  };
}
