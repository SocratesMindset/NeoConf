"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleString("ru-RU", {
    dateStyle: "medium",
  });
}

const AdminView = observer(() => {
  const { authStore, conferenceStore } = useStore();

  const [createConferenceForm, setCreateConferenceForm] = useState({
    name: "",
    city: "",
    startDate: "",
  });
  const [sectionRepForm, setSectionRepForm] = useState({
    conferenceId: "",
    sectionName: "",
    representativeName: "",
    representativeEmail: "",
  });
  const [conferenceNotice, setConferenceNotice] = useState<Notice>(null);
  const [representativeNotice, setRepresentativeNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!sectionRepForm.conferenceId && conferenceStore.conferences[0]?.id) {
      setSectionRepForm((prev) => ({
        ...prev,
        conferenceId: conferenceStore.conferences[0]?.id ?? "",
      }));
    }
  }, [conferenceStore.conferences, sectionRepForm.conferenceId]);

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

  async function handleAssignRepresentative(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await conferenceStore.assignSectionRepresentative(sectionRepForm);
      setRepresentativeNotice({
        type: "success",
        text: "Представитель секции назначен.",
      });
      setSectionRepForm((prev) => ({
        ...prev,
        sectionName: "",
        representativeName: "",
        representativeEmail: "",
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
            : "Не удалось назначить представителя.",
      });
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

  if (authStore.user.role !== "admin") {
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
          Администратор создаёт конференции и назначает представителей секций.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
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
          onSubmit={(event) => void handleAssignRepresentative(event)}
        >
          <h2 className="text-lg font-semibold">Назначить представителя секции</h2>
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
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={sectionRepForm.sectionName}
              onChange={(event) =>
                setSectionRepForm((prev) => ({
                  ...prev,
                  sectionName: event.target.value,
                }))
              }
              placeholder="Data Science"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Имя представителя</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              value={sectionRepForm.representativeName}
              onChange={(event) =>
                setSectionRepForm((prev) => ({
                  ...prev,
                  representativeName: event.target.value,
                }))
              }
              placeholder="Екатерина Орлова"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-[#6A4A2D]">Email представителя</span>
            <input
              className="w-full rounded-xl border border-[#C7B288] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
              type="email"
              value={sectionRepForm.representativeEmail}
              onChange={(event) =>
                setSectionRepForm((prev) => ({
                  ...prev,
                  representativeEmail: event.target.value,
                }))
              }
              placeholder="section@example.com"
            />
          </label>

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
            Назначить представителя
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Конференции</h3>
          {conferenceStore.conferences.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {conferenceStore.conferences.map((conference) => (
                <li key={conference.id} className="rounded-xl bg-[#F5F5DC] px-3 py-2">
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
          <h3 className="text-base font-semibold">Представители секций</h3>
          {conferenceStore.sectionRepresentatives.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {conferenceStore.sectionRepresentatives.map((representative) => {
                const conference = conferenceStore.getConferenceById(
                  representative.conferenceId,
                );
                return (
                  <li key={representative.id} className="rounded-xl bg-[#F5F5DC] px-3 py-2">
                    <p className="font-medium">{representative.sectionName}</p>
                    <p className="text-[#816040]">
                      {representative.representativeName} ·{" "}
                      {representative.representativeEmail}
                    </p>
                    <p className="text-xs text-[#9C7A56]">
                      {conference?.name ?? "Конференция не найдена"}
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
    </section>
  );
});

export default AdminView;
