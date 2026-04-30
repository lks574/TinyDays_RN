import {
  getSelectedChild,
  type FamilyContext,
  type FamilyMemberRole,
} from "./family";

export type RemoteFamilyBootstrapInput = {
  family_name: string;
  child_name: string;
  child_birth_date: string | null;
  member_name: string;
};

export type RemoteFamilyBootstrapResult = {
  remote_family_id: string;
  remote_child_id: string;
  remote_member_id: string;
  remote_user_id: string;
  family_name: string;
  child_name: string;
  child_birth_date: string | null;
  member_name: string;
  member_role: FamilyMemberRole;
};

export type RemoteFamilyInvite = {
  invite_id: string;
  family_id: string;
  code: string;
  expires_at: string;
};

export type RemoteFamilyMapping = {
  user_id: string;
  local_family_id: string;
  remote_family_id: string;
  local_child_id: string;
  remote_child_id: string;
  local_member_id: string;
  remote_member_id: string;
  bootstrapped_at: string;
  updated_at: string;
};

export function createRemoteFamilyBootstrapInput(
  context: FamilyContext,
): RemoteFamilyBootstrapInput {
  const child = getSelectedChild(context);

  return {
    family_name: normalizeRequiredText(context.family.name, "우리 가족"),
    child_name: normalizeRequiredText(child.name, "하루"),
    child_birth_date: normalizeOptionalDate(child.birth_date),
    member_name: normalizeRequiredText(context.current_member.name, "보호자"),
  };
}

export function createRemoteFamilyMapping(
  context: FamilyContext,
  result: RemoteFamilyBootstrapResult,
  now: string,
): RemoteFamilyMapping {
  return {
    user_id: result.remote_user_id,
    local_family_id: context.family.id,
    remote_family_id: result.remote_family_id,
    local_child_id: getSelectedChild(context).id,
    remote_child_id: result.remote_child_id,
    local_member_id: context.current_member.id,
    remote_member_id: result.remote_member_id,
    bootstrapped_at: now,
    updated_at: now,
  };
}

export function normalizeRemoteFamilyInvite(
  value: unknown,
): RemoteFamilyInvite | null {
  if (!isRemoteFamilyInvite(value)) {
    return null;
  }

  return value;
}

export function normalizeRemoteFamilyMapping(
  value: unknown,
): RemoteFamilyMapping | null {
  if (!isRemoteFamilyMapping(value)) {
    return null;
  }

  return value;
}

export function normalizeRemoteFamilyBootstrapResult(
  value: unknown,
): RemoteFamilyBootstrapResult | null {
  if (!isRemoteFamilyBootstrapResult(value)) {
    return null;
  }

  return value;
}

function normalizeRequiredText(value: string, fallback: string): string {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : fallback;
}

function normalizeOptionalDate(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue.slice(0, 10) : null;
}

function isRemoteFamilyInvite(value: unknown): value is RemoteFamilyInvite {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.invite_id === "string" &&
    typeof candidate.family_id === "string" &&
    typeof candidate.code === "string" &&
    typeof candidate.expires_at === "string"
  );
}

function isRemoteFamilyMapping(value: unknown): value is RemoteFamilyMapping {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.user_id === "string" &&
    typeof candidate.local_family_id === "string" &&
    typeof candidate.remote_family_id === "string" &&
    typeof candidate.local_child_id === "string" &&
    typeof candidate.remote_child_id === "string" &&
    typeof candidate.local_member_id === "string" &&
    typeof candidate.remote_member_id === "string" &&
    typeof candidate.bootstrapped_at === "string" &&
    typeof candidate.updated_at === "string"
  );
}

function isRemoteFamilyBootstrapResult(
  value: unknown,
): value is RemoteFamilyBootstrapResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.remote_family_id === "string" &&
    typeof candidate.remote_child_id === "string" &&
    typeof candidate.remote_member_id === "string" &&
    typeof candidate.remote_user_id === "string" &&
    typeof candidate.family_name === "string" &&
    typeof candidate.child_name === "string" &&
    (typeof candidate.child_birth_date === "string" ||
      candidate.child_birth_date === null) &&
    typeof candidate.member_name === "string" &&
    (candidate.member_role === "parent" || candidate.member_role === "family")
  );
}
