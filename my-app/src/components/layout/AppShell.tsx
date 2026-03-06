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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F0E4C9] text-[#3F2A18]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#D4B483]/35 blur-3xl" />
        <div className="absolute bottom-20 -left-20 h-72 w-72 rounded-full bg-[#C28A52]/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-[#B2703A]/20 blur-3xl" />
      </div>
      {header}
      <main className="mx-auto flex w-full max-w-5xl flex-1 animate-[pageReveal_550ms_ease-out] px-6 py-10">
        <div className="w-full rounded-3xl border border-[#DDCCAB] bg-[#F5F5DC]/85 p-6 shadow-[0_20px_40px_-26px_rgba(115,66,34,0.65)] sm:p-8">
          {children}
        </div>
      </main>
      {footer}
    </div>
  );
}
