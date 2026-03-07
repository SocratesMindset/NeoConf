import Link from "next/link";

const navigationItems = [
  { href: "/", label: "Главная" },
  { href: "/participant", label: "Участник" },
  { href: "/reviewer", label: "Рецензент" },
  { href: "/section-chair", label: "Председатель секции" },
  { href: "/admin", label: "Админ" },
  { href: "/auth/login", label: "Вход" },
  { href: "/auth/register", label: "Регистрация" },
];

export function Header() {
  return (
    <header className="border-b border-[#D8C8A8] bg-[#734222] backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-lg font-semibold tracking-tight">
          <Link href="/">NeoConf</Link>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-[#D8C8A8] bg-[#F5F5DC] px-3 py-1.5 text-[#5D4128] transition hover:border-[#C7B288] hover:bg-[#EFE3C8] hover:text-[#3F2A18]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
