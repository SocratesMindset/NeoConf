import { makeAutoObservable } from "mobx";

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
  fileName: string;
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

interface CreateConferenceInput {
  name: string;
  city: string;
  startDate: string;
}

interface RegisterParticipantInput {
  conferenceId: string;
  participantName: string;
  participantEmail: string;
}

interface SubmitArticleInput {
  conferenceId: string;
  sectionName: string;
  title: string;
  abstract: string;
  authorName: string;
  fileName: string;
}

interface AssignReviewerInput {
  articleId: string;
  reviewerName: string;
  reviewerEmail: string;
  assignedBy: string;
}

interface SubmitReviewInput {
  articleId: string;
  reviewerName: string;
  reviewerEmail: string;
  score: number;
  comment: string;
}

interface AssignSectionRepresentativeInput {
  conferenceId: string;
  sectionName: string;
  representativeName: string;
  representativeEmail: string;
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

const DEFAULT_SECTIONS = [
  "Искусственный интеллект",
  "Data Science",
  "Разработка ПО",
  "Кибербезопасность",
];

export class ConferenceStore {
  conferences: Conference[] = [
    {
      id: "conf-neoconf-2026",
      name: "NeoConf 2026",
      city: "Москва",
      startDate: "2026-05-20",
      createdAt: new Date().toISOString(),
    },
  ];

  participantRegistrations: ParticipantRegistration[] = [];
  articles: Article[] = [];
  reviewerAssignments: ReviewerAssignment[] = [];
  reviews: Review[] = [];
  sectionRepresentatives: SectionRepresentative[] = [];

  constructor() {
    makeAutoObservable(this);
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

  createConference(input: CreateConferenceInput) {
    const name = this.requireValue(input.name, "Название конференции");
    const city = this.requireValue(input.city, "Город");
    const startDate = this.requireValue(input.startDate, "Дата начала");

    this.conferences.unshift({
      id: createId("conf"),
      name,
      city,
      startDate,
      createdAt: new Date().toISOString(),
    });
  }

  registerParticipant(input: RegisterParticipantInput) {
    this.ensureConferenceExists(input.conferenceId);
    const participantName = this.requireValue(
      input.participantName,
      "Имя участника",
    );
    const participantEmail = this.requireValue(
      input.participantEmail,
      "Email участника",
    );

    this.participantRegistrations.unshift({
      id: createId("registration"),
      conferenceId: input.conferenceId,
      participantName,
      participantEmail: participantEmail.toLowerCase(),
      createdAt: new Date().toISOString(),
    });
  }

  submitArticle(input: SubmitArticleInput) {
    this.ensureConferenceExists(input.conferenceId);
    const sectionName = this.requireValue(input.sectionName, "Секция");
    const title = this.requireValue(input.title, "Название статьи");
    const abstract = this.requireValue(input.abstract, "Аннотация");
    const authorName = this.requireValue(input.authorName, "Имя автора");
    const fileName = this.requireValue(input.fileName, "Файл статьи");

    this.articles.unshift({
      id: createId("article"),
      conferenceId: input.conferenceId,
      sectionName,
      title,
      abstract,
      authorName,
      fileName,
      createdAt: new Date().toISOString(),
    });
  }

  assignReviewer(input: AssignReviewerInput) {
    this.ensureArticleExists(input.articleId);
    const reviewerName = this.requireValue(
      input.reviewerName,
      "Имя рецензента",
    );
    const reviewerEmail = this.requireValue(
      input.reviewerEmail,
      "Email рецензента",
    );
    const assignedBy = this.requireValue(
      input.assignedBy,
      "Имя председателя секции",
    );

    const normalizedEmail = reviewerEmail.toLowerCase();
    const alreadyAssigned = this.reviewerAssignments.some(
      (assignment) =>
        assignment.articleId === input.articleId &&
        assignment.reviewerEmail.toLowerCase() === normalizedEmail,
    );

    if (alreadyAssigned) {
      throw new Error("Этот рецензент уже назначен на выбранную статью.");
    }

    this.reviewerAssignments.unshift({
      id: createId("assignment"),
      articleId: input.articleId,
      reviewerName,
      reviewerEmail: normalizedEmail,
      assignedBy,
      createdAt: new Date().toISOString(),
    });
  }

  submitReview(input: SubmitReviewInput) {
    this.ensureArticleExists(input.articleId);
    const reviewerName = this.requireValue(
      input.reviewerName,
      "Имя рецензента",
    );
    const reviewerEmail = this.requireValue(
      input.reviewerEmail,
      "Email рецензента",
    ).toLowerCase();
    const comment = this.requireValue(input.comment, "Текст рецензии");
    const score = Number(input.score);

    if (!Number.isFinite(score) || score < 1 || score > 10) {
      throw new Error("Оценка должна быть числом от 1 до 10.");
    }

    const hasAssignment = this.reviewerAssignments.some(
      (assignment) =>
        assignment.articleId === input.articleId &&
        assignment.reviewerEmail.toLowerCase() === reviewerEmail,
    );

    if (!hasAssignment) {
      throw new Error(
        "Рецензент не назначен на эту статью председателем секции.",
      );
    }

    const existingReviewIndex = this.reviews.findIndex(
      (review) =>
        review.articleId === input.articleId &&
        review.reviewerEmail.toLowerCase() === reviewerEmail,
    );

    const newReviewData: Omit<Review, "id"> = {
      articleId: input.articleId,
      reviewerName,
      reviewerEmail,
      score,
      comment,
      createdAt: new Date().toISOString(),
    };

    if (existingReviewIndex >= 0) {
      this.reviews[existingReviewIndex] = {
        ...this.reviews[existingReviewIndex],
        ...newReviewData,
      };
      return;
    }

    this.reviews.unshift({
      id: createId("review"),
      ...newReviewData,
    });
  }

  assignSectionRepresentative(input: AssignSectionRepresentativeInput) {
    this.ensureConferenceExists(input.conferenceId);
    const sectionName = this.requireValue(input.sectionName, "Название секции");
    const representativeName = this.requireValue(
      input.representativeName,
      "Имя представителя секции",
    );
    const representativeEmail = this.requireValue(
      input.representativeEmail,
      "Email представителя секции",
    );

    this.sectionRepresentatives.unshift({
      id: createId("section-rep"),
      conferenceId: input.conferenceId,
      sectionName,
      representativeName,
      representativeEmail: representativeEmail.toLowerCase(),
      createdAt: new Date().toISOString(),
    });
  }

  private ensureConferenceExists(conferenceId: string) {
    if (!this.getConferenceById(conferenceId)) {
      throw new Error("Выбранная конференция не найдена.");
    }
  }

  private ensureArticleExists(articleId: string) {
    if (!this.getArticleById(articleId)) {
      throw new Error("Выбранная статья не найдена.");
    }
  }

  private requireValue(value: string, label: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      throw new Error(`Поле "${label}" обязательно для заполнения.`);
    }
    return trimmedValue;
  }
}
