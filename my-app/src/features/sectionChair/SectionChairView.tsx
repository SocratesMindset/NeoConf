"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";
import { userHasRole } from "@/lib/client-auth";
import { apiRequest } from "@/services/apiClient";
import type { AuthUser } from "@/types/domain";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const SectionChairView = observer(() => {
  const { authStore, conferenceStore } = useStore();
  const [notice, setNotice] = useState<Notice>(null);
  const [form, setForm] = useState({
    articleIds: [] as string[],
    reviewerUserId: "",
  });

  const managedSectionKeys = new Set(
    conferenceStore.sectionRepresentatives
      .filter(
        (representative) =>
          representative.representativeUserId === authStore.user?.id ||
          representative.representativeEmail.toLowerCase() ===
            authStore.user?.email.toLowerCase(),
      )
      .map(
        (representative) =>
          `${representative.conferenceId}::${representative.sectionName}`,
      ),
  );
  const canAccessAsChair =
    userHasRole(authStore.user, "section-chair") || managedSectionKeys.size > 0;

  const mySectionRepresentations = conferenceStore.sectionRepresentatives.filter(
    (representative) =>
      representative.representativeUserId === authStore.user?.id ||
      representative.representativeEmail.toLowerCase() ===
        authStore.user?.email.toLowerCase(),
  );

  const visibleArticles = conferenceStore.articles.filter((article) =>
    managedSectionKeys.has(`${article.conferenceId}::${article.sectionName}`),
  );

  const visibleAssignments = conferenceStore.reviewerAssignments.filter(
    (assignment) => {
      const article = conferenceStore.getArticleById(assignment.articleId);
      if (!article) {
        return false;
      }

      return managedSectionKeys.has(
        `${article.conferenceId}::${article.sectionName}`,
      );
    },
  );

  const selectedArticles = visibleArticles.filter((article) =>
    form.articleIds.includes(article.id),
  );

  const [availableReviewers, setAvailableReviewers] = useState<AuthUser[]>(
    [],
  );

  useEffect(() => {
    let cancelled = false;

    apiRequest<AuthUser[]>("/api/users?role=reviewer")
      .then((data) => {
        if (!cancelled) setAvailableReviewers(data);
      })
      .catch(() => {
        if (!cancelled) setAvailableReviewers([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleArticle(articleId: string) {
    setForm((prev) => {
      const hasArticle = prev.articleIds.includes(articleId);
      return {
        articleIds: hasArticle
          ? prev.articleIds.filter((id) => id !== articleId)
          : [...prev.articleIds, articleId],
        reviewerUserId: "",
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await conferenceStore.assignReviewer(form);
      setNotice({
        type: "success",
        text: "Рецензент назначен на выбранные статьи.",
      });
      setForm({
        articleIds: [],
        reviewerUserId: "",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Не удалось назначить рецензента.",
      });
    }
  }

  if (!authStore.user) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Страница председателя секции
        </h1>
        <p className="text-[#6A4A2D]">
          Для назначения рецензентов войдите под аккаунтом председателя секции.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex rounded-full bg-[#734222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
        >
          Войти
        </Link>
      </section>
    );
  }

  if (!canAccessAsChair) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Страница председателя секции
        </h1>
        <p className="text-[#6A4A2D]">
          Эта страница доступна пользователю, которого администратор назначил
          председателем секции.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Страница председателя секции
        </h1>
        <p className="text-[#6A4A2D]">
          Председатель назначает рецензентов только на статьи своей секции.
        </p>
        {!managedSectionKeys.size ? (
          <p className="rounded-xl bg-[#F5F5DC] px-4 py-3 text-sm text-[#6A4A2D]">
            Администратор пока не закрепил за вами секцию на конференции.
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <h2 className="text-lg font-semibold">Назначить рецензента</h2>

          <div className="rounded-xl bg-[#F5F5DC] px-3 py-2 text-sm text-[#5D4128]">
            {authStore.user.fullName} · {authStore.user.email}
          </div>

          <div className="space-y-1">
            <span className="text-sm text-[#6A4A2D]">Статьи</span>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[#C7B288] px-3 py-3 text-sm">
              {visibleArticles.map((article) => (
                <label
                  key={article.id}
                  className="flex items-start gap-3 rounded-xl bg-[#F5F5DC] px-3 py-2 text-[#5D4128]"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[#734222]"
                    checked={form.articleIds.includes(article.id)}
                    onChange={() => toggleArticle(article.id)}
                  />
                  <span className="space-y-1">
                    <span className="block font-medium">{article.title}</span>
                    <span className="block text-xs text-[#816040]">
                      {article.sectionName} ·{" "}
                      {conferenceStore.getConferenceById(article.conferenceId)
                        ?.name ?? "Конференция"}
                    </span>
                  </span>
                </label>
              ))}
              {!visibleArticles.length ? (
                <p className="text-sm text-[#816040]">
                  На ваши секции пока не подано статей.
                </p>
              ) : null}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Рецензент</span>
            <select
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={form.reviewerUserId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  reviewerUserId: event.target.value,
                }))
              }
            >
              <option value="">Выберите рецензента</option>
              {availableReviewers.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.fullName} · {candidate.email}
                </option>
              ))}
            </select>
          </label>

          {selectedArticles.length ? (
            <p className="text-sm text-[#816040]">
              Выбрано статей: {selectedArticles.length}
            </p>
          ) : null}

          {!availableReviewers.length ? (
            <p className="text-sm text-[#816040]">
              Пока нет ни одного пользователя с ролью рецензента.
            </p>
          ) : null}

          {notice ? (
            <p
              className={
                notice.type === "success"
                  ? "text-sm text-emerald-700"
                  : "text-sm text-red-700"
              }
            >
              {notice.text}
            </p>
          ) : null}

          <button
            className="rounded-full bg-[#734222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
            type="submit"
            disabled={!form.articleIds.length || !form.reviewerUserId}
          >
            Назначить
          </button>
        </form>

        <div className="space-y-6">
          {mySectionRepresentations.length ? (
            <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
              <h3 className="text-base font-semibold">
                Скачать статьи секции
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {mySectionRepresentations.map((representative) => (
                  <li
                    key={representative.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#F5F5DC] px-3 py-2"
                  >
                    <span className="text-[#5D4128]">
                      {representative.sectionName} ·{" "}
                      {conferenceStore.getConferenceById(
                        representative.conferenceId,
                      )?.name ?? "Конференция"}
                    </span>
                    <a
                      href={`/api/articles/download-zip?conferenceId=${encodeURIComponent(representative.conferenceId)}&sectionName=${encodeURIComponent(representative.sectionName)}`}
                      className="shrink-0 text-xs text-[#734222] underline"
                    >
                      Скачать zip
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
            <h3 className="text-base font-semibold">
              Поданные статьи моей секции
            </h3>
            {visibleArticles.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {visibleArticles.slice(0, 8).map((article) => {
                  const conference = conferenceStore.getConferenceById(
                    article.conferenceId,
                  );
                  return (
                    <li
                      key={article.id}
                      className="rounded-xl bg-[#F5F5DC] px-3 py-2"
                    >
                      <p className="font-medium">{article.title}</p>
                      <p className="text-[#816040]">
                        {article.authorName} ·{" "}
                        {conference?.name ?? "Конференция"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#816040]">
                На ваши секции пока не подано статей.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
            <h3 className="text-base font-semibold">Текущие назначения</h3>
            {visibleAssignments.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {visibleAssignments.slice(0, 8).map((assignment) => {
                  const article = conferenceStore.getArticleById(
                    assignment.articleId,
                  );
                  return (
                    <li
                      key={assignment.id}
                      className="rounded-xl bg-[#F5F5DC] px-3 py-2"
                    >
                      <p className="font-medium">
                        {article?.title ?? "Статья не найдена"}
                      </p>
                      <p className="text-[#816040]">
                        {assignment.reviewerName} · {assignment.reviewerEmail}
                      </p>
                      <p className="text-xs text-[#9C7A56]">
                        Назначил: {assignment.assignedBy} ·{" "}
                        {formatDate(assignment.createdAt)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#816040]">
                Назначений пока нет.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

export default SectionChairView;
