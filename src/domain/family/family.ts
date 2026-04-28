export type FamilyMemberRole = "parent" | "family";

export type FamilyProfile = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ChildProfile = {
  id: string;
  family_id: string;
  name: string;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  name: string;
  role: FamilyMemberRole;
};

export type FamilyContext = {
  family: FamilyProfile;
  children: readonly ChildProfile[];
  selected_child_id: string;
  current_member: FamilyMember;
};

export type LogOwnerContext = {
  child_id: string;
  family_id: string;
  created_by: string;
};

export const DEFAULT_FAMILY_ID = "local-family";
export const DEFAULT_CHILD_ID = "local-child";
export const DEFAULT_PARENT_ID = "local-parent";
export const DEFAULT_CHILD_BIRTH_DATE = "2025-12-30";

export const FAMILY_MEMBER_ROLES: readonly FamilyMemberRole[] = [
  "parent",
  "family",
] as const;

export function createDefaultFamilyContext(now: string): FamilyContext {
  return {
    family: {
      id: DEFAULT_FAMILY_ID,
      name: "우리 가족",
      created_at: now,
      updated_at: now,
    },
    children: [
      {
        id: DEFAULT_CHILD_ID,
        family_id: DEFAULT_FAMILY_ID,
        name: "하루",
        birth_date: DEFAULT_CHILD_BIRTH_DATE,
        created_at: now,
        updated_at: now,
      },
    ],
    selected_child_id: DEFAULT_CHILD_ID,
    current_member: {
      id: DEFAULT_PARENT_ID,
      family_id: DEFAULT_FAMILY_ID,
      name: "보호자",
      role: "parent",
    },
  };
}

export function normalizeFamilyContext(
  value: unknown,
  now: string,
): FamilyContext {
  if (!isFamilyContext(value)) {
    return createDefaultFamilyContext(now);
  }

  const selectedChild = value.children.find(
    (child) => child.id === value.selected_child_id,
  );

  if (selectedChild === undefined) {
    return {
      ...value,
      selected_child_id: value.children[0].id,
    };
  }

  return value;
}

export function getSelectedChild(context: FamilyContext): ChildProfile {
  return (
    context.children.find((child) => child.id === context.selected_child_id) ??
    context.children[0]
  );
}

export function getLogOwnerContext(context: FamilyContext): LogOwnerContext {
  return {
    child_id: getSelectedChild(context).id,
    family_id: context.family.id,
    created_by: context.current_member.id,
  };
}

export function calculateDayCount(
  birthDate: string | null,
  now: string,
): number | null {
  if (birthDate === null) {
    return null;
  }

  const birthDay = parseDateOnly(birthDate);
  const today = parseDateOnly(now);

  if (birthDay === null || today === null) {
    return null;
  }

  const diffDays = Math.floor(
    (today.getTime() - birthDay.getTime()) / 86400000,
  );

  return diffDays >= 0 ? diffDays + 1 : null;
}

function isFamilyContext(value: unknown): value is FamilyContext {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isFamilyProfile(candidate.family) &&
    Array.isArray(candidate.children) &&
    candidate.children.length > 0 &&
    candidate.children.every(isChildProfile) &&
    typeof candidate.selected_child_id === "string" &&
    isFamilyMember(candidate.current_member)
  );
}

function isFamilyProfile(value: unknown): value is FamilyProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.created_at === "string" &&
    typeof candidate.updated_at === "string"
  );
}

function isChildProfile(value: unknown): value is ChildProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.family_id === "string" &&
    typeof candidate.name === "string" &&
    isNullableString(candidate.birth_date) &&
    typeof candidate.created_at === "string" &&
    typeof candidate.updated_at === "string"
  );
}

function isFamilyMember(value: unknown): value is FamilyMember {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.family_id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.role === "string" &&
    FAMILY_MEMBER_ROLES.includes(candidate.role as FamilyMemberRole)
  );
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function parseDateOnly(value: string): Date | null {
  const dateKey = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (match === null) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}
