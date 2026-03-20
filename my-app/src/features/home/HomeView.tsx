"use client";

import Link from "next/link";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";
import { roleHomePaths, roleLabels } from "@/lib/client-auth";
import ConferenceBank from "./components/ConferenceBank";

const roleCards = [
  {
    title: "Участник",
    description: "Регистрация на конференцию и отправка статьи.",
    href: "/participant",
    actionLabel: "Открыть страницу участника",
  },
  {
    title: "Рецензент",
    description: "Рецензирование назначенных статей.",
    href: "/reviewer",
    actionLabel: "Открыть страницу рецензента",
  },
  {
    title: "Председатель секции",
    description: "Назначение рецензентов на статьи.",
    href: "/section-chair",
    actionLabel: "Открыть страницу председателя",
  },
  {
    title: "Администратор",
    description: "Создание конференций и назначение представителей секций.",
    href: "/admin",
    actionLabel: "Открыть админ-панель",
  },
];

const HomeView = observer(() => {
  const { appStore, authStore, conferenceStore } = useStore();

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#816040]">
          Платформа управления конференцией
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {appStore.appName}
        </h1>
        <p className="max-w-2xl text-base text-[#6A4A2D]">
          Основной функционал разделён по ролям. Выберите нужный рабочий
          кабинет.
        </p>
      </div>

      <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Доступ в систему</h2>
        {authStore.user ? (
          <>
            <p className="mt-2 text-sm text-[#6A4A2D]">
              Вы вошли как {authStore.user.fullName}. Роль:{" "}
              {roleLabels[authStore.user.role]}.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={roleHomePaths[authStore.user.role]}
                className="inline-flex rounded-full bg-[#734222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
              >
                Открыть мой кабинет
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-[#6A4A2D]">
              Регистрация и вход подключены к серверу, данные сохраняются в
              Postgres.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/auth/login"
                className="inline-flex rounded-full bg-[#734222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
              >
                Вход
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex rounded-full border border-[#C7B288] bg-[#F5F5DC] px-4 py-2 text-sm font-medium text-[#5D4128] transition hover:bg-[#EFE3C8]"
              >
                Регистрация
              </Link>
            </div>
          </>
        )}
      </div>

      <ConferenceBank />

      <div className="grid gap-6 sm:grid-cols-2">
        {roleCards.map((role) => (
          <article
            key={role.href}
            className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">{role.title}</h2>
            <p className="mt-2 text-sm text-[#6A4A2D]">{role.description}</p>
            <Link
              href={role.href}
              className="mt-4 inline-flex rounded-full bg-[#734222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
            >
              {role.actionLabel}
            </Link>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Конференций</h3>
          <p className="mt-2 text-3xl font-semibold">
            {conferenceStore.conferences.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Загруженных статей</h3>
          <p className="mt-2 text-3xl font-semibold">
            {conferenceStore.articles.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h3 className="text-base font-semibold">Оставленных рецензий</h3>
          <p className="mt-2 text-3xl font-semibold">
            {conferenceStore.reviews.length}
          </p>
        </div>
      </div>
    </section>
  );
});

export default HomeView;
