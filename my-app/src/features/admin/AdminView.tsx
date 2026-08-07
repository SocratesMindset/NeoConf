"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";
import { userHasRole } from "@/lib/client-auth";
import { roleOptions } from "@/lib/roles";
import { apiRequest } from "@/services/apiClient";
import type { AppRole, AuthUser } from "@/types/domain";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleString("ru-RU", {
    dateStyle: "medium",
  });
}

function extractErrorMessage(error: unknown, fallback: string) {
  return typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
    ? error.message
    : fallback;
}

function ArticlesManager() {
  const { conferenceStore } = useStore();
  const [selectedConferenceId, setSelectedConferenceId] = useState("");
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(
    null,
  );
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!selectedConferenceId && conferenceStore.conferences[0]?.id) {
      setSelectedConferenceId(conferenceStore.conferences[0].id);
    }
  }, [conferenceStore.conferences, selectedConferenceId]);

  const articlesForConference = conferenceStore.articles.filter(
    (article) => article.conferenceId === selectedConferenceId,
  );

  async function handleDelete(articleId: string) {
    setDeletingArticleId(articleId);
    setNotice(null);
    try {
      await conferenceStore.deleteArticle(articleId);
      setNotice({ type: "success", text: "Статья удалена." });
    } catch (error) {
      setNotice({
        type: "error",
        text: extractErrorMessage(error, "Не удалось удалить статью."),
      });
    } finally {
      setDeletingArticleId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Статьи конференции</h2>
        {selectedConferenceId ? (
          <a
            href={`/api/articles/download-zip?conferenceId=${encodeURIComponent(selectedConferenceId)}`}
            className="rounded-full bg-[#734222] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#8A4F29]"
          >
            Скачать все статьи (zip)
          </a>
        ) : null}
      </div>

      <label className="mt-4 block space-y-1">
        <span className="text-sm text-[#6A4A2D]">Конференция</span>
        <select
          className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
          value={selectedConferenceId}
          onChange={(event) => setSelectedConferenceId(event.target.value)}
        >
          <option value="">Выберите конференцию</option>
          {conferenceStore.conferences.map((conference) => (
            <option key={conference.id} value={conference.id}>
              {conference.name}
            </option>
          ))}
        </select>
      </label>

      {notice ? (
        <p
          className={
            notice.type === "success"
              ? "mt-3 text-sm text-emerald-700"
              : "mt-3 text-sm text-red-700"
          }
        >
          {notice.text}
        </p>
      ) : null}

      {articlesForConference.length ? (
        <ul className="mt-4 space-y-2 text-sm">
          {articlesForConference.map((article) => (
            <li
              key={article.id}
              className="rounded-xl bg-[#F5F5DC] px-3 py-2"
            >
              <p className="font-medium">{article.title}</p>
              <p className="text-[#816040]">
                {article.authorName} · {article.sectionName}
              </p>
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
                  onClick={() => void handleDelete(article.id)}
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
        <p className="mt-4 text-sm text-[#816040]">
          {selectedConferenceId
            ? "На эту конференцию статей пока нет."
            : "Конференций пока нет."}
        </p>
      )}
    </div>
  );
}

function UserRolesEditor() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [draftRoles, setDraftRoles] = useState<Record<string, AppRole[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    let cancelled = false;

    apiRequest<AuthUser[]>("/api/admin/users")
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        setDraftRoles(
          Object.fromEntries(data.map((user) => [user.id, user.roles])),
        );
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(
          extractErrorMessage(error, "Не удалось загрузить пользователей."),
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleDraftRole(userId: string, role: AppRole) {
    setDraftRoles((prev) => {
      const current = prev[userId] ?? [];
      const next = current.includes(role)
        ? current.filter((value) => value !== role)
        : [...current, role];
      return { ...prev, [userId]: next };
    });
  }

  async function handleSave(userId: string) {
    setSavingUserId(userId);
    setNotice(null);

    try {
      const roles = draftRoles[userId] ?? [];
      const updated = await apiRequest<AuthUser>(
        `/api/admin/users/${userId}/roles`,
        {
          method: "PATCH",
          body: JSON.stringify({ roles }),
        },
      );
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updated : user)),
      );
      setNotice({
        type: "success",
        text: `Роли для ${updated.fullName} обновлены.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: extractErrorMessage(error, "Не удалось обновить роли."),
      });
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Управление пользователями</h2>
      <p className="mt-1 text-sm text-[#6A4A2D]">
        Доступно только суперадминистратору: назначение и снятие ролей, вплоть
        до понижения администратора до участника.
      </p>

      {notice ? (
        <p
          className={
            notice.type === "success"
              ? "mt-3 text-sm text-emerald-700"
              : "mt-3 text-sm text-red-700"
          }
        >
          {notice.text}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-3 text-sm text-[#816040]">Загрузка...</p>
      ) : loadError ? (
        <p className="mt-3 text-sm text-red-700">{loadError}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {users.map((user) => (
            <li key={user.id} className="rounded-xl bg-[#F5F5DC] p-4">
              <p className="font-medium">{user.fullName}</p>
              <p className="text-sm text-[#816040]">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-1.5 rounded-full border border-[#C7B288] bg-white px-3 py-1 text-xs text-[#5D4128]"
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-[#734222]"
                      checked={(draftRoles[user.id] ?? []).includes(
                        option.value,
                      )}
                      onChange={() => toggleDraftRole(user.id, option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="mt-3 rounded-full bg-[#734222] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#8A4F29] disabled:opacity-60"
                disabled={savingUserId === user.id}
                onClick={() => void handleSave(user.id)}
              >
                {savingUserId === user.id ? "Сохранение..." : "Сохранить роли"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const AdminView = observer(() => {
  const { authStore, conferenceStore } = useStore();

  const [createConferenceForm, setCreateConferenceForm] = useState({
    name: "",
    city: "",
    startDate: "",
  });
  const [createSectionForm, setCreateSectionForm] = useState({
    conferenceId: "",
    name: "",
  });
  const [sectionRepForm, setSectionRepForm] = useState({
    conferenceId: "",
    sectionName: "",
    representativeUserId: "",
  });
  const [conferenceNotice, setConferenceNotice] = useState<Notice>(null);
  const [sectionNotice, setSectionNotice] = useState<Notice>(null);
  const [representativeNotice, setRepresentativeNotice] =
    useState<Notice>(null);
  const [removingRepresentativeId, setRemovingRepresentativeId] = useState<
    string | null
  >(null);

  const [eligibleSectionChairs, setEligibleSectionChairs] = useState<
    AuthUser[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    apiRequest<AuthUser[]>("/api/users?role=section-chair")
      .then((data) => {
        if (!cancelled) setEligibleSectionChairs(data);
      })
      .catch(() => {
        if (!cancelled) setEligibleSectionChairs([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const availableSections = useMemo(() => {
    if (!sectionRepForm.conferenceId) {
      return [];
    }

    return conferenceStore.getSectionsForConference(
      sectionRepForm.conferenceId,
    );
  }, [conferenceStore, sectionRepForm.conferenceId]);

  useEffect(() => {
    if (!createSectionForm.conferenceId && conferenceStore.conferences[0]?.id) {
      setCreateSectionForm((prev) => ({
        ...prev,
        conferenceId: conferenceStore.conferences[0]?.id ?? "",
      }));
    }
  }, [conferenceStore.conferences, createSectionForm.conferenceId]);

  useEffect(() => {
    if (!sectionRepForm.conferenceId && conferenceStore.conferences[0]?.id) {
      setSectionRepForm((prev) => ({
        ...prev,
        conferenceId: conferenceStore.conferences[0]?.id ?? "",
      }));
    }
  }, [conferenceStore.conferences, sectionRepForm.conferenceId]);

  useEffect(() => {
    if (!availableSections.includes(sectionRepForm.sectionName)) {
      setSectionRepForm((prev) => ({
        ...prev,
        sectionName: availableSections[0] ?? "",
      }));
    }
  }, [availableSections, sectionRepForm.sectionName]);

  useEffect(() => {
    const isSelectedUserAvailable = eligibleSectionChairs.some(
      (candidate) => candidate.id === sectionRepForm.representativeUserId,
    );

    if (eligibleSectionChairs.length && !isSelectedUserAvailable) {
      setSectionRepForm((prev) => ({
        ...prev,
        representativeUserId: eligibleSectionChairs[0]?.id ?? "",
      }));
    } else if (
      !eligibleSectionChairs.length &&
      sectionRepForm.representativeUserId
    ) {
      setSectionRepForm((prev) => ({
        ...prev,
        representativeUserId: "",
      }));
    }
  }, [eligibleSectionChairs, sectionRepForm.representativeUserId]);

  async function handleCreateConference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await conferenceStore.createConference(createConferenceForm);
      setConferenceNotice({ type: "success", text: "Конференция создана." });
      setCreateConferenceForm({ name: "", city: "", startDate: "" });
    } catch (error) {
      setConferenceNotice({
        type: "error",
        text:
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Не удалось создать конференцию.",
      });
    }
  }

  async function handleCreateSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await conferenceStore.createSection(createSectionForm);
      setSectionNotice({ type: "success", text: "Секция создана." });
      setCreateSectionForm((prev) => ({ ...prev, name: "" }));
    } catch (error) {
      setSectionNotice({
        type: "error",
        text: extractErrorMessage(error, "Не удалось создать секцию."),
      });
    }
  }

  async function handleAssignRepresentative(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await conferenceStore.assignSectionRepresentative(sectionRepForm);
      setRepresentativeNotice({
        type: "success",
        text: "Председатель секции назначен.",
      });
      setSectionRepForm((prev) => ({
        ...prev,
        sectionName: "",
        representativeUserId: eligibleSectionChairs[0]?.id ?? "",
      }));
    } catch (error) {
      setRepresentativeNotice({
        type: "error",
        text:
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Не удалось назначить председателя секции.",
      });
    }
  }

  async function handleRemoveRepresentative(representativeId: string) {
    setRemovingRepresentativeId(representativeId);
    setRepresentativeNotice(null);
    try {
      await conferenceStore.removeSectionRepresentative(representativeId);
      setRepresentativeNotice({ type: "success", text: "Председатель снят." });
    } catch (error) {
      setRepresentativeNotice({
        type: "error",
        text: extractErrorMessage(error, "Не удалось снять председателя."),
      });
    } finally {
      setRemovingRepresentativeId(null);
    }
  }

  if (!authStore.user) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Админ-панель</h1>
        <p className="text-[#6A4A2D]">
          Для доступа войдите под аккаунтом администратора.
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

  if (!userHasRole(authStore.user, "admin")) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Админ-панель</h1>
        <p className="text-[#6A4A2D]">
          Доступ есть только у роли администратора. Сейчас вы вошли под
          аккаунтом {authStore.user.fullName}.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Админ-панель</h1>
        <p className="text-[#6A4A2D]">
          Администратор создаёт конференции и назначает председателей секций из
          числа пользователей, зарегистрированных на конференцию.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
          onSubmit={(event) => void handleCreateConference(event)}
        >
          <h2 className="text-lg font-semibold">Создать конференцию</h2>
          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Название</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={createConferenceForm.name}
              onChange={(event) =>
                setCreateConferenceForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              placeholder="NeoConf Summer 2026"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Город</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={createConferenceForm.city}
              onChange={(event) =>
                setCreateConferenceForm((prev) => ({
                  ...prev,
                  city: event.target.value,
                }))
              }
              placeholder="Санкт-Петербург"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Дата начала</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              type="date"
              value={createConferenceForm.startDate}
              onChange={(event) =>
                setCreateConferenceForm((prev) => ({
                  ...prev,
                  startDate: event.target.value,
                }))
              }
            />
          </label>

          {conferenceNotice ? (
            <p
              className={
                conferenceNotice.type === "success"
                  ? "text-sm text-emerald-700"
                  : "text-sm text-red-700"
              }
            >
              {conferenceNotice.text}
            </p>
          ) : null}

          <button
            className="rounded-full bg-[#734222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
            type="submit"
          >
            Создать конференцию
          </button>
        </form>

        <form
          className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
          onSubmit={(event) => void handleCreateSection(event)}
        >
          <h2 className="text-lg font-semibold">Создать секцию</h2>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Конференция</span>
            <select
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={createSectionForm.conferenceId}
              onChange={(event) =>
                setCreateSectionForm((prev) => ({
                  ...prev,
                  conferenceId: event.target.value,
                }))
              }
            >
              <option value="">Выберите конференцию</option>
              {conferenceStore.conferences.map((conference) => (
                <option key={conference.id} value={conference.id}>
                  {conference.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Название секции</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={createSectionForm.name}
              onChange={(event) =>
                setCreateSectionForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              placeholder="Data Science"
            />
          </label>

          {sectionNotice ? (
            <p
              className={
                sectionNotice.type === "success"
                  ? "text-sm text-emerald-700"
                  : "text-sm text-red-700"
              }
            >
              {sectionNotice.text}
            </p>
          ) : null}

          <button
            className="rounded-full bg-[#734222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
            type="submit"
          >
            Создать секцию
          </button>
        </form>

        <form
          className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
          onSubmit={(event) => void handleAssignRepresentative(event)}
        >
          <h2 className="text-lg font-semibold">
            Назначить председателя секции
          </h2>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Конференция</span>
            <select
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={sectionRepForm.conferenceId}
              onChange={(event) =>
                setSectionRepForm((prev) => ({
                  ...prev,
                  conferenceId: event.target.value,
                }))
              }
            >
              <option value="">Выберите конференцию</option>
              {conferenceStore.conferences.map((conference) => (
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
              value={sectionRepForm.sectionName}
              onChange={(event) =>
                setSectionRepForm((prev) => ({
                  ...prev,
                  sectionName: event.target.value,
                }))
              }
            >
              <option value="">Выберите секцию</option>
              {availableSections.map((sectionName) => (
                <option key={sectionName} value={sectionName}>
                  {sectionName}
                </option>
              ))}
            </select>
          </label>

          {sectionRepForm.conferenceId && !availableSections.length ? (
            <p className="text-sm text-[#816040]">
              На выбранной конференции пока нет ни одной секции — создайте её
              слева.
            </p>
          ) : null}

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Пользователь</span>
            <select
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={sectionRepForm.representativeUserId}
              onChange={(event) =>
                setSectionRepForm((prev) => ({
                  ...prev,
                  representativeUserId: event.target.value,
                }))
              }
            >
              <option value="">Выберите пользователя</option>
              {eligibleSectionChairs.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.fullName} · {candidate.email}
                </option>
              ))}
            </select>
          </label>

          {!eligibleSectionChairs.length ? (
            <p className="text-sm text-[#816040]">
              Пока нет ни одного пользователя с ролью председателя секции.
            </p>
          ) : null}

          {representativeNotice ? (
            <p
              className={
                representativeNotice.type === "success"
                  ? "text-sm text-emerald-700"
                  : "text-sm text-red-700"
              }
            >
              {representativeNotice.text}
            </p>
          ) : null}

          <button
            className="rounded-full bg-[#734222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
            type="submit"
          >
            Назначить председателя
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Конференции</h3>
          {conferenceStore.conferences.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {conferenceStore.conferences.map((conference) => (
                <li
                  key={conference.id}
                  className="rounded-xl bg-[#F5F5DC] px-3 py-2"
                >
                  <p className="font-medium">{conference.name}</p>
                  <p className="text-[#816040]">
                    {conference.city} · {formatDate(conference.startDate)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#816040]">Конференций пока нет.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Секции</h3>
          {conferenceStore.sections.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {conferenceStore.sections.map((section) => {
                const conference = conferenceStore.getConferenceById(
                  section.conferenceId,
                );
                return (
                  <li
                    key={section.id}
                    className="rounded-xl bg-[#F5F5DC] px-3 py-2"
                  >
                    <p className="font-medium">{section.name}</p>
                    <p className="text-xs text-[#9C7A56]">
                      {conference?.name ?? "Конференция не найдена"}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#816040]">Секций пока нет.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Председатели секций</h3>
          <p className="mt-1 text-xs text-[#816040]">
            У одной секции может быть несколько председателей.
          </p>

          {representativeNotice ? (
            <p
              className={
                representativeNotice.type === "success"
                  ? "mt-2 text-sm text-emerald-700"
                  : "mt-2 text-sm text-red-700"
              }
            >
              {representativeNotice.text}
            </p>
          ) : null}

          {conferenceStore.sectionRepresentatives.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {conferenceStore.sectionRepresentatives.map((representative) => {
                const conference = conferenceStore.getConferenceById(
                  representative.conferenceId,
                );
                return (
                  <li
                    key={representative.id}
                    className="rounded-xl bg-[#F5F5DC] px-3 py-2"
                  >
                    <p className="font-medium">{representative.sectionName}</p>
                    <p className="text-[#816040]">
                      {representative.representativeName} ·{" "}
                      {representative.representativeEmail}
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="text-xs text-[#9C7A56]">
                        {conference?.name ?? "Конференция не найдена"}
                      </p>
                      <button
                        type="button"
                        className="shrink-0 text-xs text-red-700 underline disabled:opacity-50"
                        disabled={removingRepresentativeId === representative.id}
                        onClick={() =>
                          void handleRemoveRepresentative(representative.id)
                        }
                      >
                        {removingRepresentativeId === representative.id
                          ? "Снятие..."
                          : "Снять"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#816040]">Назначений пока нет.</p>
          )}
        </div>
      </div>

      <ArticlesManager />

      {userHasRole(authStore.user, "superadmin") ? <UserRolesEditor /> : null}
    </section>
  );
});

export default AdminView;
