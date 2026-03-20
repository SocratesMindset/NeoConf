"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";

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

const ReviewerView = observer(() => {
  const { authStore, conferenceStore } = useStore();
  const [notice, setNotice] = useState<Notice>(null);
  const [form, setForm] = useState({
    articleId: "",
    score: "8",
    comment: "",
  });

  const reviewerEmail = authStore.user?.email.trim().toLowerCase() ?? "";
  const visibleAssignments = reviewerEmail
    ? conferenceStore.reviewerAssignments.filter(
        (assignment) => assignment.reviewerEmail.toLowerCase() === reviewerEmail,
      )
    : [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await conferenceStore.submitReview({
        articleId: form.articleId,
        score: Number(form.score),
        comment: form.comment,
      });
      setNotice({ type: "success", text: "Рецензия сохранена." });
      setForm({
        articleId: "",
        score: "8",
        comment: "",
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
            : "Не удалось сохранить рецензию.",
      });
    }
  }

  if (!authStore.user) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Страница рецензента</h1>
        <p className="text-[#6A4A2D]">
          Для работы со статьями нужно войти под аккаунтом рецензента.
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

  if (authStore.user.role !== "reviewer") {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Страница рецензента</h1>
        <p className="text-[#6A4A2D]">
          Эта страница доступна только для роли рецензента.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Страница рецензента</h1>
        <p className="text-[#6A4A2D]">
          Рецензент оставляет рецензии только по назначенным ему статьям.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <h2 className="text-lg font-semibold">Новая рецензия</h2>

          <div className="rounded-xl bg-[#F5F5DC] px-3 py-2 text-sm text-[#5D4128]">
            {authStore.user.fullName} · {authStore.user.email}
          </div>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Статья</span>
            <select
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={form.articleId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, articleId: event.target.value }))
              }
            >
              <option value="">Выберите статью</option>
              {visibleAssignments.map((assignment) => {
                const article = conferenceStore.getArticleById(assignment.articleId);
                if (!article) {
                  return null;
                }
                return (
                  <option key={assignment.id} value={article.id}>
                    {article.title}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Оценка (1-10)</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              type="number"
              min={1}
              max={10}
              value={form.score}
              onChange={(event) => setForm((prev) => ({ ...prev, score: event.target.value }))}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Комментарий</span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={form.comment}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, comment: event.target.value }))
              }
              placeholder="Сильные и слабые стороны работы"
            />
          </label>

          {notice ? (
            <p className={notice.type === "success" ? "text-sm text-emerald-700" : "text-sm text-red-700"}>
              {notice.text}
            </p>
          ) : null}

          <button
            className="rounded-full bg-[#734222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
            type="submit"
          >
            Сохранить рецензию
          </button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
            <h3 className="text-base font-semibold">Мои назначения</h3>
            {visibleAssignments.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {visibleAssignments.map((assignment) => {
                  const article = conferenceStore.getArticleById(assignment.articleId);
                  return (
                    <li key={assignment.id} className="rounded-xl bg-[#F5F5DC] px-3 py-2">
                      <p className="font-medium">{article?.title ?? "Статья удалена"}</p>
                      <p className="text-[#816040]">Назначил: {assignment.assignedBy}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#816040]">
                Для вашего аккаунта пока нет назначений.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
            <h3 className="text-base font-semibold">Последние рецензии</h3>
            {conferenceStore.reviews.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {conferenceStore.reviews.slice(0, 6).map((review) => {
                  const article = conferenceStore.getArticleById(review.articleId);
                  return (
                    <li key={review.id} className="rounded-xl bg-[#F5F5DC] px-3 py-2">
                      <p className="font-medium">{article?.title ?? "Статья не найдена"}</p>
                      <p className="text-[#816040]">
                        {review.reviewerName} · {review.score}/10
                      </p>
                      <p className="text-xs text-[#9C7A56]">{formatDate(review.createdAt)}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#816040]">Рецензий пока нет.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
});

export default ReviewerView;
