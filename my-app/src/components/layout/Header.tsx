"use client";

import Link from "next/link";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useStore } from "@/app/providers/StoreProvider";

const navigationItems = [
  { href: "/", label: "Главная" },
  { href: "/participant", label: "Участник" },
  { href: "/reviewer", label: "Рецензент" },
  { href: "/section-chair", label: "Председатель секции" },
  { href: "/admin", label: "Админ" },
  { href: "/instruction", label: "Инструкция" },
];

export const Header = observer(function Header() {
  const router = useRouter();
  const { authStore } = useStore();

  async function handleLogout() {
    try {
      await authStore.logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  }

  return (
    <header className="border-b border-[#D8C8A8] bg-[#734222] backdrop-blur">
      <div className="flex w-full flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <Link className="text-white text-5xl" href="/">
            NeoConf
          </Link>
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
          {authStore.user ? (
            <>
              <span className="rounded-full border border-[#D8C8A8] bg-[#F5F5DC] px-3 py-1.5 text-[#5D4128]">
                {authStore.user.fullName}
              </span>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-full border border-[#D8C8A8] bg-[#F5F5DC] px-3 py-1.5 text-[#5D4128] transition hover:border-[#C7B288] hover:bg-[#EFE3C8] hover:text-[#3F2A18]"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full border border-[#D8C8A8] bg-[#F5F5DC] px-3 py-1.5 text-[#5D4128] transition hover:border-[#C7B288] hover:bg-[#EFE3C8] hover:text-[#3F2A18]"
              >
                Вход
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full border border-[#D8C8A8] bg-[#F5F5DC] px-3 py-1.5 text-[#5D4128] transition hover:border-[#C7B288] hover:bg-[#EFE3C8] hover:text-[#3F2A18]"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
});
