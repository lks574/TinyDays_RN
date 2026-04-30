import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeRemoteFamilyBootstrapResult,
  normalizeRemoteFamilyInvite,
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
