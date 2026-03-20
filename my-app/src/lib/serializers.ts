import type {
  Article,
  AuthUser,
  Conference,
  ParticipantRegistration,
  Review,
  ReviewerAssignment,
  SectionRepresentative,
} from "@/types/domain";
import { dbRoleToAppRole, normalizeEmail, type DbRole } from "@/lib/roles";

type SerializableDate = Date | string;

function toIsoString(value: SerializableDate) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

export function serializeUser(user: {
  id: string;
  fullName: string;
  email: string;
  role: DbRole;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: normalizeEmail(user.email),
    role: dbRoleToAppRole(user.role),
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeConference(conference: {
  id: string;
  name: string;
  city: string;
  startDate: SerializableDate;
  createdAt: SerializableDate;
}): Conference {
  return {
    id: conference.id,
    name: conference.name,
    city: conference.city,
    startDate: toIsoString(conference.startDate),
    createdAt: toIsoString(conference.createdAt),
  };
}

export function serializeParticipantRegistration(registration: {
  id: string;
  conferenceId: string;
  createdAt: SerializableDate;
  user: {
    fullName: string;
    email: string;
  };
}): ParticipantRegistration {
  return {
    id: registration.id,
    conferenceId: registration.conferenceId,
    participantName: registration.user.fullName,
    participantEmail: normalizeEmail(registration.user.email),
    createdAt: toIsoString(registration.createdAt),
  };
}

export function serializeArticle(article: {
  id: string;
  conferenceId: string;
  sectionName: string;
  title: string;
  abstract: string;
  originalFileName: string;
  fileSizeBytes: number;
  createdAt: SerializableDate;
  author: {
    fullName: string;
    email: string;
  };
}): Article {
  return {
    id: article.id,
    conferenceId: article.conferenceId,
    sectionName: article.sectionName,
    title: article.title,
    abstract: article.abstract,
    authorName: article.author.fullName,
    authorEmail: normalizeEmail(article.author.email),
    fileName: article.originalFileName,
    fileSizeBytes: article.fileSizeBytes,
    fileDownloadUrl: `/api/articles/${article.id}/file`,
    createdAt: toIsoString(article.createdAt),
  };
}

export function serializeReviewerAssignment(assignment: {
  id: string;
  articleId: string;
  reviewerName: string;
  reviewerEmail: string;
  assignedBy: string;
  createdAt: SerializableDate;
}): ReviewerAssignment {
  return {
    id: assignment.id,
    articleId: assignment.articleId,
    reviewerName: assignment.reviewerName,
    reviewerEmail: normalizeEmail(assignment.reviewerEmail),
    assignedBy: assignment.assignedBy,
    createdAt: toIsoString(assignment.createdAt),
  };
}

export function serializeReview(review: {
  id: string;
  articleId: string;
  score: number;
  comment: string;
  createdAt: SerializableDate;
  reviewer: {
    fullName: string;
    email: string;
  };
}): Review {
  return {
    id: review.id,
    articleId: review.articleId,
    reviewerName: review.reviewer.fullName,
    reviewerEmail: normalizeEmail(review.reviewer.email),
    score: review.score,
    comment: review.comment,
    createdAt: toIsoString(review.createdAt),
  };
}

export function serializeSectionRepresentative(representative: {
  id: string;
  conferenceId: string;
  sectionName: string;
  representativeName: string;
  representativeEmail: string;
  createdAt: SerializableDate;
}): SectionRepresentative {
  return {
    id: representative.id,
    conferenceId: representative.conferenceId,
    sectionName: representative.sectionName,
    representativeName: representative.representativeName,
    representativeEmail: normalizeEmail(representative.representativeEmail),
    createdAt: toIsoString(representative.createdAt),
  };
}
