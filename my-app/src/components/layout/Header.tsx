export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="text-lg font-semibold tracking-tight">NeoConf</div>
        <div className="text-sm text-slate-600">
          База проекта · Next.js · MobX
        </div>
      </div>
    </header>
  );
}
