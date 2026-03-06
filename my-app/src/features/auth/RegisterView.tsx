"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

const roleOptions = [
  { value: "participant", label: "Участник" },
  { value: "reviewer", label: "Рецензент" },
  { value: "section-chair", label: "Председатель секции" },
  { value: "admin", label: "Администратор" },
];

const RegisterView = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "participant",
    password: "",
    confirmPassword: "",
    agreeWithPolicy: false,
  });
  const [notice, setNotice] = useState<Notice>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.email.trim()) {
      setNotice({ type: "error", text: "Укажите имя и email." });
      return;
    }

    if (!form.password || form.password.length < 6) {
      setNotice({
        type: "error",
        text: "Пароль должен содержать минимум 6 символов.",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setNotice({ type: "error", text: "Пароли не совпадают." });
      return;
    }

    if (!form.agreeWithPolicy) {
      setNotice({
        type: "error",
        text: "Подтвердите согласие с правилами платформы.",
      });
      return;
    }

    setNotice({
      type: "success",
      text: "Регистрация сверстана. Подключение API и БД сделаем следующим шагом.",
    });
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#816040]">
          Регистрация
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Создать аккаунт</h1>
        <p className="text-sm text-[#6A4A2D]">
          Пока только фронтовая часть: валидация и UX без сохранения данных.
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

        <label className="block space-y-1">
          <span className="text-sm text-[#6A4A2D]">Роль</span>
          <select
            className="w-full rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
            value={form.role}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, role: event.target.value }))
            }
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-[#6A4A2D]">Пароль</span>
          <input
            className="w-full rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="Минимум 6 символов"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-[#6A4A2D]">Повторите пароль</span>
          <input
            className="w-full rounded-xl border border-[#C7B288] bg-[#F5F5DC] px-3 py-2 text-sm outline-none focus:border-[#8A5A2A]"
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
            }
            placeholder="Введите пароль повторно"
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
          <p className={notice.type === "success" ? "text-sm text-emerald-700" : "text-sm text-red-700"}>
            {notice.text}
          </p>
        ) : null}

        <button
          className="w-full rounded-full bg-[#734222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
          type="submit"
        >
          Зарегистрироваться
        </button>
      </form>

      <p className="text-sm text-[#6A4A2D]">
        Уже есть аккаунт?{" "}
        <Link className="font-semibold text-[#734222] underline" href="/auth/login">
          Войти
        </Link>
      </p>
    </section>
  );
};

export default RegisterView;
