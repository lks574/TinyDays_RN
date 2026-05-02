import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeRemoteFamilyBootstrapResult,
  normalizeRemoteFamilyInvite,
  normalizeRemoteFamilyInvites,
  type RemoteFamilyBootstrapResult,
  type RemoteFamilyInvite,
} from "../../domain/family";

export async function createRemoteFamilyInvite(
  client: SupabaseClient,
  familyId: string,
): Promise<RemoteFamilyInvite> {
  const { data, error } = await client.rpc("create_family_invite", {
    family_id_input: familyId,
  });

  if (error !== null) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const invite = normalizeRemoteFamilyInvite(row);

  if (invite === null) {
    throw new Error("원격 가족 초대 결과를 해석하지 못했습니다.");
  }

  return invite;
}

export async function acceptRemoteFamilyInvite(
  client: SupabaseClient,
  input: {
    code: string;
    memberName: string;
  },
): Promise<RemoteFamilyBootstrapResult> {
  const { data, error } = await client.rpc("accept_family_invite", {
    invite_code_input: input.code,
    member_name_input: input.memberName,
  });

  if (error !== null) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const result = normalizeRemoteFamilyBootstrapResult(row);

  if (result === null) {
    throw new Error("원격 가족 초대 수락 결과를 해석하지 못했습니다.");
  }

  return result;
}

export async function listPendingRemoteFamilyInvites(
  client: SupabaseClient,
  familyId: string,
): Promise<RemoteFamilyInvite[]> {
  const { data, error } = await client
    .from("family_invites")
    .select(
      "invite_id:id,family_id,code,expires_at,accepted_at,revoked_at,created_at",
    )
    .eq("family_id", familyId)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error !== null) {
    throw new Error(error.message);
  }

  const invites = normalizeRemoteFamilyInvites(data);

  if (invites === null) {
    throw new Error("원격 가족 초대 목록을 해석하지 못했습니다.");
  }

  return invites;
}

export async function cancelRemoteFamilyInvite(
  client: SupabaseClient,
  inviteId: string,
): Promise<RemoteFamilyInvite> {
  const { data, error } = await client.rpc("cancel_family_invite", {
    invite_id_input: inviteId,
  });

  if (error !== null) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const invite = normalizeRemoteFamilyInvite(row);

  if (invite === null) {
    throw new Error("원격 가족 초대 취소 결과를 해석하지 못했습니다.");
  }

  return invite;
}
