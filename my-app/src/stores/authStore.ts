"use client";

import { makeAutoObservable, runInAction } from "mobx";
import { apiRequest } from "@/services/apiClient";
import type { AppRole, AuthUser } from "@/types/domain";

type AuthResponse = {
  user: AuthUser;
};

type CurrentUserResponse = {
  user: AuthUser | null;
};

interface RegisterInput {
  fullName: string;
  email: string;
  role: AppRole;
  password: string;
  confirmPassword: string;
  agreeWithPolicy: boolean;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthStore {
  user: AuthUser | null = null;
  isHydrating = false;
  isSubmitting = false;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isAuthenticated() {
    return Boolean(this.user);
  }

  async hydrate(force = false) {
    if (this.isHydrating) {
      return;
    }

    if (this.hasHydrated && !force) {
      return;
    }

    this.isHydrating = true;

    try {
      const response = await apiRequest<CurrentUserResponse>("/api/auth/me");
      runInAction(() => {
        this.user = response.user;
        this.hasHydrated = true;
      });
    } finally {
      runInAction(() => {
        this.isHydrating = false;
      });
    }
  }

  async register(input: RegisterInput) {
    this.isSubmitting = true;

    try {
      const response = await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });

      runInAction(() => {
        this.user = response.user;
        this.hasHydrated = true;
      });

      return response.user;
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  }

  async login(input: LoginInput) {
    this.isSubmitting = true;

    try {
      const response = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });

      runInAction(() => {
        this.user = response.user;
        this.hasHydrated = true;
      });

      return response.user;
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  }

  async logout() {
    this.isSubmitting = true;

    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });

      runInAction(() => {
        this.user = null;
        this.hasHydrated = true;
      });
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  }
}
