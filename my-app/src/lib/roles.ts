import type { AppRole } from "@/types/domain";

export type DbRole = "PARTICIPANT" | "REVIEWER" | "SECTION_CHAIR" | "ADMIN";

export const roleOptions: { value: AppRole; label: string }[] = [
  { value: "participant", label: "Участник" },
  { value: "reviewer", label: "Рецензент" },
  { value: "section-chair", label: "Председатель секции" },
  { value: "admin", label: "Администратор" },
];

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function appRoleToDbRole(role: AppRole) {
  switch (role) {
    case "participant":
      return "PARTICIPANT";
    case "reviewer":
      return "REVIEWER";
    case "section-chair":
      return "SECTION_CHAIR";
    case "admin":
      return "ADMIN";
  }

  throw new Error(`Unsupported role: ${role satisfies never}`);
}

export function dbRoleToAppRole(role: DbRole): AppRole {
  switch (role) {
    case "PARTICIPANT":
      return "participant";
    case "REVIEWER":
      return "reviewer";
    case "SECTION_CHAIR":
      return "section-chair";
    case "ADMIN":
      return "admin";
  }

  throw new Error(`Unsupported role: ${role satisfies never}`);
}
