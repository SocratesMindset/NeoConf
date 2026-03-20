import type { AppRole } from "@/types/domain";

export const roleLabels: Record<AppRole, string> = {
  participant: "Участник",
  reviewer: "Рецензент",
  "section-chair": "Председатель секции",
  admin: "Администратор",
};

export const roleHomePaths: Record<AppRole, string> = {
  participant: "/participant",
  reviewer: "/reviewer",
  "section-chair": "/section-chair",
  admin: "/admin",
};
