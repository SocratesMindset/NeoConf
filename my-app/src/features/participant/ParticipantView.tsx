"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";
import { userHasRole } from "@/lib/client-auth";

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

const ParticipantView = observer(() => {
  const { authStore, conferenceStore } = useStore();
  const conferences = conferenceStore.conferences;
  const hasParticipantRole = userHasRole(authStore.user, "participant");
  const currentUserEmail = authStore.user?.email.trim().toLowerCase() ?? "";

  const [registrationForm, setRegistrationForm] = useState({
    conferenceId: "",
  });
  const [articleForm, setArticleForm] = useState({
    title: "",
    abstract: "",
    conferenceId: "",
    sectionName: "",
    file: null as File | null,
  });
  const [fileInputKey, setFileInputKey] = useState(0);
  const [registrationNotice, setRegistrationNotice] = useState<Notice>(null);
  const [articleNotice, setArticleNotice] = useState<Notice>(null);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const defaultConferenceId = conferences[0]?.id ?? "";

    if (!registrationForm.conferenceId && defaultConferenceId) {
      setRegistrationForm({ conferenceId: defaultConferenceId });
    }

    if (!articleForm.conferenceId && defaultConferenceId) {
      const sections =
        conferenceStore.getSectionsForConference(defaultConferenceId);
      setArticleForm((prev) => ({
        ...prev,
        conferenceId: defaultConferenceId,
        sectionName: sections[0] ?? "",
      }));
    }
  }, [
    articleForm.conferenceId,
    conferenceStore,
    conferences,
    registrationForm.conferenceId,
  ]);

  const myRegistrations = conferenceStore.participantRegistrations.filter(
    (registration) =>
      registration.participantEmail.toLowerCase() === currentUserEmail,
  );
  const myArticles = conferenceStore.articles.filter(
    (article) => article.authorEmail.toLowerCase() === currentUserEmail,
  );
  const myArticleIds = new Set(myArticles.map((article) => article.id));
  const myReviews = conferenceStore.reviews
    .filter((review) => myArticleIds.has(review.articleId))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );
  const articleSections = articleForm.conferenceId
    ? conferenceStore.getSectionsForConference(articleForm.conferenceId)
    : [];

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await conferenceStore.registerParticipant(registrationForm.conferenceId);
      setRegistrationNotice({
        type: "success",
        text: "Вы успешно зарегистрированы на конференцию.",
      });
    } catch (error) {
      setRegistrationNotice({
        type: "error",
        text:
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Не удалось зарегистрироваться.",
      });
    }
  }

  async function handleArticleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (!articleForm.file) {
        throw new Error("Выберите файл статьи.");
      }

      await conferenceStore.submitArticle({
        conferenceId: articleForm.conferenceId,
        sectionName: articleForm.sectionName,
        title: articleForm.title,
        abstract: articleForm.abstract,
        file: articleForm.file,
      });

      const sections = articleForm.conferenceId
        ? conferenceStore.getSectionsForConference(articleForm.conferenceId)
        : [];

      setArticleNotice({
        type: "success",
        text: "Статья загружена в систему.",
      });
      setArticleForm((prev) => ({
        ...prev,
        title: "",
        abstract: "",
        sectionName: sections[0] ?? "",
        file: null,
      }));
      setFileInputKey((prev) => prev + 1);
    } catch (error) {
      setArticleNotice({
        type: "error",
        text:
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Не удалось загрузить статью.",
      });
    }
  }

  async function handleDeleteArticle(articleId: string) {
    setDeletingArticleId(articleId);
    setArticleNotice(null);
    try {
      await conferenceStore.deleteArticle(articleId);
      setArticleNotice({ type: "success", text: "Статья удалена." });
    } catch (error) {
      setArticleNotice({
        type: "error",
        text:
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Не удалось удалить статью.",
      });
    } finally {
      setDeletingArticleId(null);
    }
  }

  if (!authStore.user) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Страница участника
        </h1>
        <p className="text-[#6A4A2D]">
          Для регистрации на конференцию и отправки статьи нужно войти в
          систему.
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

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Страница участника
        </h1>
        <p className="text-[#6A4A2D]">
          Здесь можно зарегистрироваться на конференцию. Отправка статьи
          доступна пользователям с ролью участника.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
          onSubmit={(event) => void handleRegistrationSubmit(event)}
        >
          <h2 className="text-lg font-semibold">Регистрация на конференцию</h2>

          <div className="rounded-xl bg-[#F5F5DC] px-3 py-2 text-sm text-[#5D4128]">
            {authStore.user.fullName} · {authStore.user.email}
          </div>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Конференция</span>
            <select
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={registrationForm.conferenceId}
              onChange={(event) =>
                setRegistrationForm({
                  conferenceId: event.target.value,
                })
              }
            >
              <option value="">Выберите конференцию</option>
              {conferences.map((conference) => (
                <option key={conference.id} value={conference.id}>
                  {conference.name}
                </option>
              ))}
            </select>
          </label>

          {registrationNotice ? (
            <p
              className={
                registrationNotice.type === "success"
                  ? "text-sm text-emerald-700"
                  : "text-sm text-red-700"
              }
            >
              {registrationNotice.text}
            </p>
          ) : null}

          <button
            className="rounded-full bg-[#734222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
            type="submit"
          >
            Зарегистрироваться
          </button>
        </form>

        {hasParticipantRole ? (
          <form
            className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
            onSubmit={(event) => void handleArticleSubmit(event)}
          >
            <h2 className="text-lg font-semibold">Загрузка статьи</h2>

            <div className="rounded-xl bg-[#F5F5DC] px-3 py-2 text-sm text-[#5D4128]">
              Автор: {authStore.user.fullName}
            </div>

            <label className="block space-y-1">
              <span className="text-sm text-[#6A4A2D]">Название статьи</span>
              <input
                className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
                value={articleForm.title}
                onChange={(event) =>
                  setArticleForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="Например: Data Pipelines in 2026"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-[#6A4A2D]">Аннотация</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
                value={articleForm.abstract}
                onChange={(event) =>
                  setArticleForm((prev) => ({
                    ...prev,
                    abstract: event.target.value,
                  }))
                }
                placeholder="Кратко опишите содержание статьи"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-[#6A4A2D]">Конференция</span>
              <select
                className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
                value={articleForm.conferenceId}
                onChange={(event) =>
                  setArticleForm((prev) => {
                    const nextConferenceId = event.target.value;
                    const nextSections = nextConferenceId
                      ? conferenceStore.getSectionsForConference(
                          nextConferenceId,
                        )
                      : [];

                    return {
                      ...prev,
                      conferenceId: nextConferenceId,
                      sectionName: nextSections[0] ?? "",
                    };
                  })
                }
              >
                <option value="">Выберите конференцию</option>
                {conferences.map((conference) => (
                  <option key={conference.id} value={conference.id}>
                    {conference.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-[#6A4A2D]">Секция</span>
              <select
                className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
                value={articleForm.sectionName}
                onChange={(event) =>
                  setArticleForm((prev) => ({
                    ...prev,
                    sectionName: event.target.value,
                  }))
                }
              >
                <option value="">Выберите секцию</option>
                {articleSections.map((sectionName) => (
                  <option key={sectionName} value={sectionName}>
                    {sectionName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-[#6A4A2D]">Файл статьи</span>
              <input
                key={fileInputKey}
                className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[#734222] file:px-4 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#8A4F29]"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) =>
                  setArticleForm((prev) => ({
                    ...prev,
                    file: event.target.files?.[0] ?? null,
                  }))
                }
              />
            </label>

            {articleNotice ? (
              <p
                className={
                  articleNotice.type === "success"
                    ? "text-sm text-emerald-700"
                    : "text-sm text-red-700"
                }
              >
                {articleNotice.text}
              </p>
            ) : null}

            <button
              className="rounded-full bg-[#734222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
              type="submit"
            >
              Отправить статью
            </button>
          </form>
        ) : (
          <div className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Загрузка статьи</h2>
            <p className="text-sm text-[#6A4A2D]">
              Отправка статьи доступна только пользователям с ролью участника.
            </p>
            <p className="rounded-xl bg-[#F5F5DC] px-3 py-2 text-sm text-[#5D4128]">
              Ваш аккаунт можно зарегистрировать на конференцию, но для подачи
              статьи нужна роль участника.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Мои регистрации</h3>
          {myRegistrations.length ? (
            <ul className="mt-3 space-y-2 text-sm text-[#5D4128]">
              {myRegistrations.map((registration) => (
                <li
                  key={registration.id}
                  className="rounded-xl bg-[#F5F5DC] px-3 py-2"
                >
                  <p className="font-medium">
                    {conferenceStore.getConferenceById(
                      registration.conferenceId,
                    )?.name ?? "Конференция"}
                  </p>
                  <p className="text-xs text-[#9C7A56]">
                    {formatDate(registration.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#816040]">Регистраций пока нет.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Мои статьи</h3>
          {myArticles.length ? (
            <ul className="mt-3 space-y-2 text-sm text-[#5D4128]">
              {myArticles.map((article) => (
                <li
                  key={article.id}
                  className="rounded-xl bg-[#F5F5DC] px-3 py-2"
                >
                  <p className="font-medium">{article.title}</p>
                  <p className="text-[#816040]">{article.sectionName}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <Link
                      href={article.fileDownloadUrl}
                      className="text-xs text-[#734222] underline"
                    >
                      {article.fileName}
                    </Link>
                    <button
                      type="button"
                      className="text-xs text-red-700 underline disabled:opacity-50"
                      disabled={deletingArticleId === article.id}
                      onClick={() => void handleDeleteArticle(article.id)}
                    >
                      {deletingArticleId === article.id
                        ? "Удаление..."
                        : "Удалить"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#816040]">Статей пока нет.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Рецензии по моим статьям</h3>
          {myReviews.length ? (
            <ul className="mt-3 space-y-2 text-sm text-[#5D4128]">
              {myReviews.map((review) => {
                const article = conferenceStore.getArticleById(
                  review.articleId,
                );
                return (
                  <li
                    key={review.id}
                    className="rounded-xl bg-[#F5F5DC] px-3 py-2"
                  >
                    <p className="font-medium">
                      {article?.title ?? "Статья удалена"}
                    </p>
                    <p className="text-[#816040]">
                      {review.reviewerName} · Оценка: {review.score}/10
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-[#5D4128]">
                      {review.comment}
                    </p>
                    <p className="mt-1 text-xs text-[#9C7A56]">
                      {formatDate(review.createdAt)}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#816040]">
              По вашим статьям пока нет рецензий.
            </p>
          )}
        </div>
      </div>
    </section>
  );
});

export default ParticipantView;
