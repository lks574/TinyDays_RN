import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeRemoteFamilyBootstrapResult,
  type FamilyMemberRole,
  type RemoteFamilyBootstrapInput,
  type RemoteFamilyBootstrapResult,
} from "../../domain/family";

type FamilyMemberRow = {
  id: string;
  family_id: string;
  user_id: string;
  name: string;
  role: FamilyMemberRole;
};

type ChildRow = {
  id: string;
  family_id: string;
  name: string;
  birth_date: string | null;
};

export async function bootstrapRemoteFamily(
  client: SupabaseClient,
  input: RemoteFamilyBootstrapInput,
): Promise<RemoteFamilyBootstrapResult> {
  const { data, error } = await client.rpc("bootstrap_family", {
    family_name_input: input.family_name,
    child_name_input: input.child_name,
    child_birth_date_input: input.child_birth_date,
    member_name_input: input.member_name,
  });

  if (error !== null) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const result = normalizeRemoteFamilyBootstrapResult(row);

  if (result === null) {
    throw new Error("원격 가족 생성 결과를 해석하지 못했습니다.");
  }

  return result;
}

export async function getExistingRemoteFamily(
  client: SupabaseClient,
  userId: string,
): Promise<RemoteFamilyBootstrapResult | null> {
  const { data: memberData, error: memberError } = await client
    .from("family_members")
    .select("id,family_id,user_id,name,role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memberError !== null) {
    throw new Error(memberError.message);
  }

  if (memberData === null) {
    return null;
  }

  const member = normalizeFamilyMemberRow(memberData);

  if (member === null) {
    throw new Error("원격 가족 구성원 정보를 해석하지 못했습니다.");
  }

  const [{ data: familyData, error: familyError }, { data: childData, error: childError }] =
    await Promise.all([
      client
        .from("families")
        .select("id,name")
        .eq("id", member.family_id)
        .single(),
      client
        .from("children")
        .select("id,family_id,name,birth_date")
        .eq("family_id", member.family_id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

  if (familyError !== null) {
    throw new Error(familyError.message);
  }

  if (childError !== null) {
    throw new Error(childError.message);
  }

  if (childData === null) {
    return null;
  }

  const family = normalizeFamilyRow(familyData);
  const child = normalizeChildRow(childData);

  if (family === null || child === null) {
    throw new Error("원격 가족 정보를 해석하지 못했습니다.");
  }

  return {
    remote_family_id: family.id,
    remote_child_id: child.id,
    remote_member_id: member.id,
    remote_user_id: member.user_id,
    family_name: family.name,
    child_name: child.name,
    child_birth_date: child.birth_date,
    member_name: member.name,
    member_role: member.role,
  };
}

function normalizeFamilyMemberRow(value: unknown): FamilyMemberRow | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.family_id !== "string" ||
    typeof candidate.user_id !== "string" ||
    typeof candidate.name !== "string" ||
    (candidate.role !== "parent" && candidate.role !== "family")
  ) {
    return null;
  }

  return candidate as FamilyMemberRow;
}

function normalizeFamilyRow(
  value: unknown,
): { id: string; name: string } | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") {
    return null;
  }

  return {
    id: candidate.id,
    name: candidate.name,
  };
}

function normalizeChildRow(value: unknown): ChildRow | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.family_id !== "string" ||
    typeof candidate.name !== "string" ||
    (typeof candidate.birth_date !== "string" &&
      candidate.birth_date !== null)
  ) {
    return null;
  }

  return candidate as ChildRow;
}
