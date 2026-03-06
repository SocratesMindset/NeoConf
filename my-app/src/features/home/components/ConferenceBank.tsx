"use client";

import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const ConferenceBank = observer(() => {
  const { conferenceStore } = useStore();

  return (
    <section className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#816040]">
            Банк конференций
          </p>
          <h2 className="text-2xl font-semibold">Текущие конференции</h2>
        </div>
        <p className="text-sm text-[#6A4A2D]">
          Всего: {conferenceStore.conferences.length}
        </p>
      </div>

      {conferenceStore.conferences.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {conferenceStore.conferences.map((conference) => {
            const registrationsCount =
              conferenceStore.participantRegistrations.filter(
                (registration) => registration.conferenceId === conference.id,
              ).length;
            const articleCount = conferenceStore.articles.filter(
              (article) => article.conferenceId === conference.id,
            ).length;

            return (
              <article
                key={conference.id}
                className="rounded-xl border border-[#D8C8A8] bg-[#F5F5DC] p-4"
              >
                <h3 className="text-lg font-semibold">{conference.name}</h3>
                <p className="mt-1 text-sm text-[#6A4A2D]">
                  {conference.city} · {formatDate(conference.startDate)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[#E9D8B6] px-3 py-1 text-[#5D4128]">
                    Участников: {registrationsCount}
                  </span>
                  <span className="rounded-full bg-[#E9D8B6] px-3 py-1 text-[#5D4128]">
                    Статей: {articleCount}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-[#816040]">
          Конференций пока нет. Создайте первую в админ-панели.
        </p>
      )}
    </section>
  );
});

export default ConferenceBank;
