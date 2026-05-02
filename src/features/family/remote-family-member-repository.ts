import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeRemoteFamilyMembers,
  type RemoteFamilyMember,
} from "../../domain/family";

export async function listRemoteFamilyMembers(
  client: SupabaseClient,
  familyId: string,
): Promise<RemoteFamilyMember[]> {
  const { data, error } = await client
    .from("family_members")
    .select("id,family_id,user_id,name,role")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  if (error !== null) {
    throw new Error(error.message);
  }

  const members = normalizeRemoteFamilyMembers(data);

  if (members === null) {
    throw new Error("원격 가족 구성원 목록을 해석하지 못했습니다.");
  }

  return members;
}

export async function removeRemoteFamilyMember(
  client: SupabaseClient,
  memberId: string,
): Promise<RemoteFamilyMember> {
  const { data, error } = await client.rpc("remove_family_member", {
    member_id_input: memberId,
  });

  if (error !== null) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const member = normalizeRemoteFamilyMembers([row]);

  if (member === null) {
    throw new Error("원격 가족 구성원 제거 결과를 해석하지 못했습니다.");
  }

  return member[0];
}
