"use client";

import { type InputHTMLAttributes, useState } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7A3 3 0 0 0 13.4 13.5" />
      <path d="M9.9 5.1A12.5 12.5 0 0 1 12 5c6.5 0 10 7 10 7a16.3 16.3 0 0 1-4 4.9" />
      <path d="M6.7 6.8C3.9 8.5 2 12 2 12a16.8 16.8 0 0 0 10 7 9.7 9.7 0 0 0 4-.8" />
    </svg>
  );
}

export function PasswordInput({
  className,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        className={["w-full pr-12", className].filter(Boolean).join(" ")}
      />
      <button
        type="button"
        aria-label={isVisible ? "Скрыть пароль" : "Показать пароль"}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((value) => !value)}
        className="absolute inset-y-0 right-0 inline-flex items-center justify-center px-3 text-[#734222] transition hover:text-[#8A4F29]"
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
