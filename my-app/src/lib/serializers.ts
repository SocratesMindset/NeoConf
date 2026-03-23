import type {
  Article,
  AuthUser,
  Conference,
  ParticipantRegistration,
  Review,
  ReviewerAssignment,
  SectionRepresentative,
} from "@/types/domain";
import {
  dbRoleToAppRole,
  dbRolesToAppRoles,
  normalizeEmail,
  resolveDbRoles,
  type DbRole,
} from "@/lib/roles";

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
  roles?: DbRole[];
  createdAt: Date;
}): AuthUser {
  const roles = dbRolesToAppRoles(resolveDbRoles(user));

  return {
    id: user.id,
    fullName: user.fullName,
    email: normalizeEmail(user.email),
    role: roles[0] ?? dbRoleToAppRole(user.role),
    roles,
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
    id: string;
    fullName: string;
    email: string;
    role: DbRole;
    roles?: DbRole[];
  };
}): ParticipantRegistration {
  const userRoles = dbRolesToAppRoles(resolveDbRoles(registration.user));

  return {
    id: registration.id,
    conferenceId: registration.conferenceId,
    userId: registration.user.id,
    userRoles,
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
  reviewerUserId: string | null;
  reviewerName: string;
  reviewerEmail: string;
  assignedBy: string;
  createdAt: SerializableDate;
}): ReviewerAssignment {
  return {
    id: assignment.id,
    articleId: assignment.articleId,
    reviewerUserId: assignment.reviewerUserId,
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
  representativeUserId: string | null;
  representativeName: string;
  representativeEmail: string;
  createdAt: SerializableDate;
}): SectionRepresentative {
  return {
    id: representative.id,
    conferenceId: representative.conferenceId,
    sectionName: representative.sectionName,
    representativeUserId: representative.representativeUserId,
    representativeName: representative.representativeName,
    representativeEmail: normalizeEmail(representative.representativeEmail),
    createdAt: toIsoString(representative.createdAt),
  };
}
