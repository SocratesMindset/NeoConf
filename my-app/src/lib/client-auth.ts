import type { AppRole, AuthUser } from "@/types/domain";

export const roleLabels: Record<AppRole, string> = {
  participant: "Участник",
  reviewer: "Рецензент",
  "section-chair": "Председатель секции",
  admin: "Администратор",
  superadmin: "Суперадминистратор",
};

export const roleHomePaths: Record<AppRole, string> = {
  participant: "/participant",
  reviewer: "/reviewer",
  "section-chair": "/section-chair",
  admin: "/admin",
  superadmin: "/admin",
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
  if (!user) {
    return false;
  }

  // Superadmin can act as any role in the UI too, mirroring the backend
  // bypass in requireUser().
  return user.roles.includes(role) || user.roles.includes("superadmin");
}
