"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/providers/StoreProvider";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { getDefaultRoleHomePath } from "@/lib/client-auth";
import { roleOptions } from "@/lib/roles";
import type { AppRole } from "@/types/domain";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

const RegisterView = observer(() => {
  const router = useRouter();
  const { authStore } = useStore();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    roles: ["participant"] as AppRole[],
    password: "",
    confirmPassword: "",
    agreeWithPolicy: false,
  });
  const [notice, setNotice] = useState<Notice>(null);

  function toggleRole(role: AppRole) {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((value) => value !== role)
        : [...prev.roles, role],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const user = await authStore.register({
        fullName: form.fullName,
        email: form.email,
        roles: form.roles,
        password: form.password,
        confirmPassword: form.confirmPassword,
        agreeWithPolicy: form.agreeWithPolicy,
      });

      setNotice({
        type: "success",
        text: "Аккаунт создан. Перенаправляем в доступный кабинет.",
      });
      router.push(getDefaultRoleHomePath(user.roles));
    } catch (error) {
      setNotice({
        type: "error",
        text:
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Не удалось зарегистрировать аккаунт.",
      });
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#816040]">
          Регистрация
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Создать аккаунт
        </h1>
        <p className="text-sm text-[#6A4A2D]">
          Аккаунт сохраняется в базе данных, а после регистрации создаётся
          сессия.
        </p>
      </header>

      <form
        className="space-y-4 rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <label className="block space-y-1">
          <span className="text-sm text-[#6A4A2D]">ФИО</span>
          <input
            className="w-full rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
            value={form.fullName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, fullName: event.target.value }))
            }
            placeholder="Иван Петров"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-[#6A4A2D]">Email</span>
          <input
            className="w-full rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="you@example.com"
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm text-[#6A4A2D]">Роли</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {roleOptions.map((role) => (
              <label
                key={role.value}
                className="flex items-start gap-2 rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm text-[#5D4128]"
              >
                <input
                  className="mt-0.5 h-4 w-4 accent-[#734222]"
                  type="checkbox"
                  checked={form.roles.includes(role.value)}
                  onChange={() => toggleRole(role.value)}
                />
                <span>{role.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-1">
          <span className="text-sm text-[#6A4A2D]">Пароль</span>
          <PasswordInput
            className="w-full rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="Минимум 6 символов"
            autoComplete="new-password"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-[#6A4A2D]">Повторите пароль</span>
          <PasswordInput
            className="w-full rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            placeholder="Введите пароль повторно"
            autoComplete="new-password"
          />
        </label>

        <label className="flex items-start gap-2 text-sm text-[#6A4A2D]">
          <input
            className="mt-0.5 h-4 w-4 accent-[#734222]"
            type="checkbox"
            checked={form.agreeWithPolicy}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                agreeWithPolicy: event.target.checked,
              }))
            }
          />
          Я согласен с правилами использования платформы.
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
          {authStore.isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className="text-sm text-[#6A4A2D]">
        Уже есть аккаунт?{" "}
        <Link
          className="font-semibold text-[#734222] underline"
          href="/auth/login"
        >
          Войти
        </Link>
      </p>
    </section>
  );
});

export default RegisterView;
