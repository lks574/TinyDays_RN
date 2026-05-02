import type { SupabaseClient } from "@supabase/supabase-js";

import {
  listRemoteFamilyMembers,
  removeRemoteFamilyMember,
} from "./remote-family-member-repository";

describe("listRemoteFamilyMembers", () => {
  it("queries remote family members by family id", async () => {
    const order = jest.fn(async () => ({
      data: [
        {
          id: "member-1",
          family_id: "family-1",
          user_id: "user-1",
          name: "보호자",
          role: "parent",
        },
        {
          id: "member-2",
          family_id: "family-1",
          user_id: "user-2",
          name: "이모",
          role: "family",
        },
      ],
      error: null,
    }));
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ select }));

    await expect(
      listRemoteFamilyMembers({ from } as unknown as SupabaseClient, "family-1"),
    ).resolves.toEqual([
      {
        id: "member-1",
        family_id: "family-1",
        user_id: "user-1",
        name: "보호자",
        role: "parent",
      },
      {
        id: "member-2",
        family_id: "family-1",
        user_id: "user-2",
        name: "이모",
        role: "family",
      },
    ]);
    expect(from).toHaveBeenCalledWith("family_members");
    expect(select).toHaveBeenCalledWith("id,family_id,user_id,name,role");
    expect(eq).toHaveBeenCalledWith("family_id", "family-1");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("throws when rows cannot be normalized", async () => {
    const order = jest.fn(async () => ({
      data: [{ id: "member-1", role: "admin" }],
      error: null,
    }));
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ select }));

    await expect(
      listRemoteFamilyMembers({ from } as unknown as SupabaseClient, "family-1"),
    ).rejects.toThrow("원격 가족 구성원 목록을 해석하지 못했습니다.");
  });

  it("removes a remote family member through RPC", async () => {
    const rpc = jest.fn(async () => ({
      data: [
        {
          id: "member-2",
          family_id: "family-1",
          user_id: "user-2",
          name: "이모",
          role: "family",
        },
      ],
      error: null,
    }));

    await expect(
      removeRemoteFamilyMember(
        { rpc } as unknown as SupabaseClient,
        "member-2",
      ),
    ).resolves.toEqual({
      id: "member-2",
      family_id: "family-1",
      user_id: "user-2",
      name: "이모",
      role: "family",
    });
    expect(rpc).toHaveBeenCalledWith("remove_family_member", {
      member_id_input: "member-2",
    });
  });
});
