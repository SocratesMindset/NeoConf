export const APP_ROLES = [
  "participant",
  "reviewer",
  "section-chair",
  "admin",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  createdAt: string;
}

export interface Conference {
  id: string;
  name: string;
  city: string;
  startDate: string;
  createdAt: string;
}

export interface ParticipantRegistration {
  id: string;
  conferenceId: string;
  participantName: string;
  participantEmail: string;
  createdAt: string;
}

export interface Article {
  id: string;
  conferenceId: string;
  sectionName: string;
  title: string;
  abstract: string;
  authorName: string;
  authorEmail: string;
  fileName: string;
  fileSizeBytes: number;
  fileDownloadUrl: string;
  createdAt: string;
}

export interface ReviewerAssignment {
  id: string;
  articleId: string;
  reviewerName: string;
  reviewerEmail: string;
  assignedBy: string;
  createdAt: string;
}

export interface Review {
  id: string;
  articleId: string;
  reviewerName: string;
  reviewerEmail: string;
  score: number;
  comment: string;
  createdAt: string;
}

export interface SectionRepresentative {
  id: string;
  conferenceId: string;
  sectionName: string;
  representativeName: string;
  representativeEmail: string;
  createdAt: string;
}

export interface AppState {
  conferences: Conference[];
  participantRegistrations: ParticipantRegistration[];
  articles: Article[];
  reviewerAssignments: ReviewerAssignment[];
  reviews: Review[];
  sectionRepresentatives: SectionRepresentative[];
}
