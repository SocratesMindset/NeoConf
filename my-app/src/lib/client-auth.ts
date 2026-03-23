import type { AppRole, AuthUser } from "@/types/domain";

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

export function getDefaultRole(roles: AppRole[]) {
  return roles[0] ?? "participant";
}

export function getDefaultRoleHomePath(roles: AppRole[]) {
  return roleHomePaths[getDefaultRole(roles)];
}

export function userHasRole(
  user: Pick<AuthUser, "roles"> | null | undefined,
  role: AppRole,
) {
  return Boolean(user?.roles.includes(role));
}
