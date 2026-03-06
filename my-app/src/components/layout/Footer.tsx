import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#8F5A34] bg-[#734222] text-[#F8EED5]">
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 text-sm md:grid-cols-3">
        <div>
          <div className="text-base font-semibold text-[#FFF4DE]">NeoConf</div>
          <p className="mt-2 text-[#EBD4AC]">
            Короткое описание проекта в 1–2 строки.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#DDBD8F]">
            Навигация
          </div>
          <ul className="mt-2 space-y-1">
            <li>
              <Link
                className="transition hover:text-[#FFF4DE]"
                href="/participant"
              >
                Участник
              </Link>
            </li>
            <li>
              <Link
                className="transition hover:text-[#FFF4DE]"
                href="/reviewer"
              >
                Рецензент
              </Link>
            </li>
            <li>
              <Link
                className="transition hover:text-[#FFF4DE]"
                href="/section-chair"
              >
                Председатель секции
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[#FFF4DE]" href="/admin">
                Админ
              </Link>
            </li>
            <li>
              <Link
                className="transition hover:text-[#FFF4DE]"
                href="/auth/login"
              >
                Вход
              </Link>
            </li>
            <li>
              <Link
                className="transition hover:text-[#FFF4DE]"
                href="/auth/register"
              >
                Регистрация
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#DDBD8F]">
            Контакты
          </div>
          <p className="mt-2">hello@neoconf.dev</p>
          <p className="text-[#EBD4AC]">GitHub · Telegram</p>
        </div>
      </div>

      <div className="border-t border-[#8F5A34]">
        <div className="mx-auto max-w-5xl px-6 py-4 text-xs text-[#DDBD8F]">
          © 2026 NeoConf. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
