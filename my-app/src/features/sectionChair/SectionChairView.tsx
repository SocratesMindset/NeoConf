"use client";

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

const SectionChairView = observer(() => {
  const { conferenceStore } = useStore();
  const [notice, setNotice] = useState<Notice>(null);
  const [form, setForm] = useState({
    assignedBy: "",
    articleId: "",
    reviewerName: "",
    reviewerEmail: "",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      conferenceStore.assignReviewer(form);
      setNotice({ type: "success", text: "Рецензент назначен на статью." });
      setForm((prev) => ({
        ...prev,
        articleId: "",
        reviewerName: "",
        reviewerEmail: "",
      }));
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Не удалось назначить рецензента.",
      });
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Страница председателя секции</h1>
        <p className="text-[#6A4A2D]">
          Председатель назначает рецензентов на поданные статьи.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-lg font-semibold">Назначить рецензента</h2>
          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Имя председателя секции</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={form.assignedBy}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, assignedBy: event.target.value }))
              }
              placeholder="Алексей Смирнов"
            />
          </label>

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
              {conferenceStore.articles.map((article) => (
                <option key={article.id} value={article.id}>
                  {article.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Имя рецензента</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={form.reviewerName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reviewerName: event.target.value }))
              }
              placeholder="Мария Петрова"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Email рецензента</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              type="email"
              value={form.reviewerEmail}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reviewerEmail: event.target.value }))
              }
              placeholder="reviewer@example.com"
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
            Назначить
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
            <h3 className="text-base font-semibold">Поданные статьи</h3>
            {conferenceStore.articles.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {conferenceStore.articles.slice(0, 8).map((article) => {
                  const conference = conferenceStore.getConferenceById(article.conferenceId);
                  return (
                    <li key={article.id} className="rounded-xl bg-[#F5F5DC] px-3 py-2">
                      <p className="font-medium">{article.title}</p>
                      <p className="text-[#816040]">
                        {article.authorName} · {conference?.name ?? "Конференция"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#816040]">Статей пока нет.</p>
            )}
          </div>

          <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
            <h3 className="text-base font-semibold">Текущие назначения</h3>
            {conferenceStore.reviewerAssignments.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {conferenceStore.reviewerAssignments.slice(0, 8).map((assignment) => {
                  const article = conferenceStore.getArticleById(assignment.articleId);
                  return (
                    <li key={assignment.id} className="rounded-xl bg-[#F5F5DC] px-3 py-2">
                      <p className="font-medium">{article?.title ?? "Статья не найдена"}</p>
                      <p className="text-[#816040]">
                        {assignment.reviewerName} · {assignment.reviewerEmail}
                      </p>
                      <p className="text-xs text-[#9C7A56]">
                        Назначил: {assignment.assignedBy} · {formatDate(assignment.createdAt)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#816040]">Назначений пока нет.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

export default SectionChairView;
