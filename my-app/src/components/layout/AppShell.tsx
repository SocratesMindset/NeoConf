import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-tight">NeoConf</div>
          <div className="text-sm text-slate-600">
            База проекта · Next.js · MobX
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-slate-200 py-6">
        <div className="mx-auto max-w-5xl px-6 text-xs text-slate-500">
          Здесь будет ваш футер и ссылки на разделы проекта.
        </div>
      </footer>
    </div>
  );
}
