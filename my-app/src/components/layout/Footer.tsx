export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <div className="text-base font-semibold text-slate-900">NeoConf</div>
          <p className="mt-2 text-slate-500">
            Короткое описание проекта в 1–2 строки.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Навигация
          </div>
          <ul className="mt-2 space-y-1">
            <li>
              <a className="hover:text-slate-900" href="#">
                Документация
              </a>
            </li>
            <li>
              <a className="hover:text-slate-900" href="#">
                Блог
              </a>
            </li>
            <li>
              <a className="hover:text-slate-900" href="#">
                Контакты
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Контакты
          </div>
          <p className="mt-2">hello@neoconf.dev</p>
          <p className="text-slate-500">GitHub · Telegram</p>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-4 text-xs text-slate-500">
          © 2026 NeoConf. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
