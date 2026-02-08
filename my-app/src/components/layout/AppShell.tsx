import type { ReactNode } from "react";

export function AppShell({
  children,
  footer,
  header,
}: {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {header}
      <main className="mx-auto w-full max-w-5xl px-6 py-10 flex-1">
        {children}
      </main>
      {footer}
    </div>
  );
}
