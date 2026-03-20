import { makeAutoObservable, runInAction } from "mobx";
import { DEFAULT_SECTIONS } from "@/lib/conference-sections";
import { apiRequest } from "@/services/apiClient";
import type {
  AppState,
  Article,
  Conference,
  ParticipantRegistration,
  Review,
  ReviewerAssignment,
  SectionRepresentative,
} from "@/types/domain";

interface CreateConferenceInput {
  name: string;
  city: string;
  startDate: string;
}

interface AssignReviewerInput {
  articleId: string;
  reviewerName: string;
  reviewerEmail: string;
}

interface SubmitReviewInput {
  articleId: string;
  score: number;
  comment: string;
}

interface AssignSectionRepresentativeInput {
  conferenceId: string;
  sectionName: string;
  representativeName: string;
  representativeEmail: string;
}

interface SubmitArticleInput {
  conferenceId: string;
  sectionName: string;
  title: string;
  abstract: string;
  file: File;
}

export class ConferenceStore {
  conferences: Conference[] = [];
  participantRegistrations: ParticipantRegistration[] = [];
  articles: Article[] = [];
  reviewerAssignments: ReviewerAssignment[] = [];
  reviews: Review[] = [];
  sectionRepresentatives: SectionRepresentative[] = [];
  isLoading = false;
  hasLoaded = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async loadState(force = false) {
    if (this.isLoading) {
      return;
    }

    if (this.hasLoaded && !force) {
      return;
    }

    this.isLoading = true;

    try {
      const state = await apiRequest<AppState>("/api/app-state");
      runInAction(() => {
        this.applyState(state);
        this.hasLoaded = true;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  private applyState(state: AppState) {
    this.conferences = state.conferences;
    this.participantRegistrations = state.participantRegistrations;
    this.articles = state.articles;
    this.reviewerAssignments = state.reviewerAssignments;
    this.reviews = state.reviews;
    this.sectionRepresentatives = state.sectionRepresentatives;
  }

  getConferenceById(conferenceId: string) {
    return this.conferences.find(
      (conference) => conference.id === conferenceId,
    );
  }

  getArticleById(articleId: string) {
    return this.articles.find((article) => article.id === articleId);
  }

  getSectionsForConference(conferenceId: string) {
    const representativeSections = this.sectionRepresentatives
      .filter((representative) => representative.conferenceId === conferenceId)
      .map((representative) => representative.sectionName.trim())
      .filter(Boolean);

    return Array.from(
      new Set([...DEFAULT_SECTIONS, ...representativeSections]),
    );
  }

  async createConference(input: CreateConferenceInput) {
    await apiRequest("/api/conferences", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await this.loadState(true);
  }

  async registerParticipant(conferenceId: string) {
    await apiRequest("/api/participant/registrations", {
      method: "POST",
      body: JSON.stringify({ conferenceId }),
    });
    await this.loadState(true);
  }

  async submitArticle(input: SubmitArticleInput) {
    const formData = new FormData();
    formData.append("conferenceId", input.conferenceId);
    formData.append("sectionName", input.sectionName);
    formData.append("title", input.title);
    formData.append("abstract", input.abstract);
    formData.append("file", input.file);

    await apiRequest("/api/articles", {
      method: "POST",
      body: formData,
    });
    await this.loadState(true);
  }

  async assignReviewer(input: AssignReviewerInput) {
    await apiRequest("/api/reviewer-assignments", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await this.loadState(true);
  }

  async submitReview(input: SubmitReviewInput) {
    await apiRequest("/api/reviews", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await this.loadState(true);
  }

  async assignSectionRepresentative(input: AssignSectionRepresentativeInput) {
    await apiRequest("/api/section-representatives", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await this.loadState(true);
  }
}
