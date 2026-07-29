import { SELF_REGISTERABLE_ROLES, type AppRole } from "@/types/domain";

export type DbRole =
  | "PARTICIPANT"
  | "REVIEWER"
  | "SECTION_CHAIR"
  | "ADMIN"
  | "SUPERADMIN";

export const roleOptions: { value: AppRole; label: string }[] = [
  { value: "participant", label: "Участник" },
  { value: "reviewer", label: "Рецензент" },
  { value: "section-chair", label: "Председатель секции" },
  { value: "admin", label: "Администратор" },
  { value: "superadmin", label: "Суперадминистратор" },
];

// Roles selectable on the public registration form — excludes "superadmin",
// which can only be granted by an existing superadmin.
export const selfRegisterableRoleOptions = roleOptions.filter((option) =>
  (SELF_REGISTERABLE_ROLES as readonly AppRole[]).includes(option.value),
);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function appRolesToDbRoles(roles: AppRole[]) {
  return Array.from(new Set(roles.map(appRoleToDbRole)));
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
    case "superadmin":
      return "SUPERADMIN";
  }

  throw new Error(`Unsupported role: ${role satisfies never}`);
}

export function dbRolesToAppRoles(roles: DbRole[]) {
  return Array.from(new Set(roles.map(dbRoleToAppRole)));
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
    case "SUPERADMIN":
      return "superadmin";
  }

  throw new Error(`Unsupported role: ${role satisfies never}`);
}

export function resolveDbRoles(user: {
  role?: DbRole;
  roles?: DbRole[] | null;
}) {
  if (user.roles?.length) {
    return Array.from(new Set(user.roles));
  }

  if (user.role) {
    return [user.role];
  }

  return [];
}
