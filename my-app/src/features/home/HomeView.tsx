"use client";

import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";

const HomeView = observer(() => {
  const { appStore } = useStore();

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Готовый шаблон
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {appStore.appName}
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Здесь можно собрать структуру проекта, подключить API, оформить
          страницы и начать писать функциональность. Компоненты ниже демонстрируют
          работу MobX.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">MobX store</p>
            <p className="text-2xl font-semibold">Счетчик: {appStore.counter}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              type="button"
              onClick={() => appStore.increment()}
            >
              +1
            </button>
            <button
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              type="button"
              onClick={() => appStore.resetCounter()}
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Структура проекта</h2>
          <p className="mt-2 text-sm text-slate-600">
            `src/features` — модули, `src/stores` — MobX стейты, `src/components`
            — общие компоненты, `src/services` — API и запросы.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Следующий шаг</h2>
          <p className="mt-2 text-sm text-slate-600">
            Меняйте название проекта, добавляйте страницы и подключайте данные —
            этот каркас уже готов к работе.
          </p>
        </div>
      </div>
    </section>
  );
});

export default HomeView;
