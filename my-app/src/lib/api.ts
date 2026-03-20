import { ZodError } from "zod";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonResponse({ message: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return jsonResponse(
      {
        message: error.issues[0]?.message ?? "Некорректные входные данные.",
      },
      { status: 400 },
    );
  }

  console.error(error);
  return jsonResponse(
    {
      message: "Внутренняя ошибка сервера.",
    },
    { status: 500 },
  );
}
