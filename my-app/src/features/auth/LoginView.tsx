"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";
import { roleHomePaths } from "@/lib/client-auth";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

const LoginView = observer(() => {
  const router = useRouter();
  const { authStore } = useStore();
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [notice, setNotice] = useState<Notice>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const user = await authStore.login({
        email: form.email,
        password: form.password,
      });

      setNotice({
        type: "success",
        text: "Авторизация успешна. Перенаправляем в рабочий кабинет.",
      });
      router.push(roleHomePaths[user.role]);
    } catch (error) {
      setNotice({
        type: "error",
        text:
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Не удалось выполнить вход.",
      });
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#816040]">
          Авторизация
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Вход в систему
        </h1>
        <p className="text-sm text-[#6A4A2D]">
          Вход работает через сессию и серверную проверку учётных данных.
        </p>
      </header>

      <form
        className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <label className="block space-y-1">
          <span className="text-sm text-[#6A4A2D]">Email</span>
          <input
            className="w-full rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-[#6A4A2D]">Пароль</span>
          <input
            className="w-full rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-[#6A4A2D]">
          <input
            className="h-4 w-4 accent-[#734222]"
            type="checkbox"
            checked={form.rememberMe}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, rememberMe: event.target.checked }))
            }
          />
          Запомнить меня
        </label>

        {notice ? (
          <p
            className={
              notice.type === "success"
                ? "text-sm text-emerald-700"
                : "text-sm text-red-700"
            }
          >
            {notice.text}
          </p>
        ) : null}

        <button
          className="w-full rounded-full bg-[#734222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
          type="submit"
          disabled={authStore.isSubmitting}
        >
          {authStore.isSubmitting ? "Входим..." : "Войти"}
        </button>
      </form>

      <p className="text-sm text-[#6A4A2D]">
        Нет аккаунта?{" "}
        <Link
          className="font-semibold text-[#734222] underline"
          href="/auth/register"
        >
          Зарегистрироваться
        </Link>
      </p>
    </section>
  );
});

export default LoginView;
