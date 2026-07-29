import { z } from "zod";
import { APP_ROLES, SELF_REGISTERABLE_ROLES } from "@/types/domain";

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Укажите ФИО."),
    email: z.email("Укажите корректный email."),
    roles: z
      .array(z.enum(SELF_REGISTERABLE_ROLES))
      .min(1, "Выберите хотя бы одну роль."),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов."),
    confirmPassword: z.string().min(1, "Повторите пароль."),
    agreeWithPolicy: z
      .boolean()
      .refine((value) => value, "Подтвердите согласие с правилами платформы."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли не совпадают.",
  });

export const loginSchema = z.object({
  email: z.email("Укажите корректный email."),
  password: z.string().min(1, "Заполните пароль."),
});

export const createConferenceSchema = z.object({
  name: z.string().trim().min(1, "Название конференции обязательно."),
  city: z.string().trim().min(1, "Город обязателен."),
  startDate: z.string().date("Укажите корректную дату начала."),
});

export const sectionRepresentativeSchema = z.object({
  conferenceId: z.string().trim().min(1, "Выберите конференцию."),
  sectionName: z.string().trim().min(1, "Название секции обязательно."),
  representativeUserId: z
    .string()
    .trim()
    .min(1, "Выберите председателя секции."),
});

export const participantRegistrationSchema = z.object({
  conferenceId: z.string().trim().min(1, "Выберите конференцию."),
});

export const reviewerAssignmentSchema = z.object({
  articleIds: z
    .array(z.string().trim().min(1))
    .min(1, "Выберите хотя бы одну статью."),
  reviewerUserId: z.string().trim().min(1, "Выберите рецензента."),
});

export const reviewSchema = z.object({
  articleId: z.string().trim().min(1, "Выберите статью."),
  score: z.coerce
    .number()
    .int()
    .min(1, "Оценка должна быть от 1 до 10.")
    .max(10, "Оценка должна быть от 1 до 10."),
  comment: z.string().trim().min(1, "Комментарий обязателен."),
});

export const updateUserRolesSchema = z.object({
  roles: z.array(z.enum(APP_ROLES)).min(1, "Выберите хотя бы одну роль."),
});
