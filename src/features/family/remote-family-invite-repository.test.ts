import type { SupabaseClient } from "@supabase/supabase-js";

import {
  acceptRemoteFamilyInvite,
  cancelRemoteFamilyInvite,
  createRemoteFamilyInvite,
  listPendingRemoteFamilyInvites,
} from "./remote-family-invite-repository";

describe("remote family invite repository", () => {
  it("creates a remote family invite through RPC", async () => {
    const rpc = jest.fn(async () => ({
      data: [
        {
          invite_id: "invite-1",
          family_id: "family-1",
          code: "A1B2C3D4",
          expires_at: "2026-05-07T00:00:00.000Z",
        },
      ],
      error: null,
    }));

    await expect(
      createRemoteFamilyInvite({ rpc } as unknown as SupabaseClient, "family-1"),
    ).resolves.toEqual({
      invite_id: "invite-1",
      family_id: "family-1",
      code: "A1B2C3D4",
      expires_at: "2026-05-07T00:00:00.000Z",
    });
    expect(rpc).toHaveBeenCalledWith("create_family_invite", {
      family_id_input: "family-1",
    });
  });

  it("accepts a remote family invite through RPC", async () => {
    const rpc = jest.fn(async () => ({
      data: {
        remote_family_id: "family-1",
        remote_child_id: "child-1",
        remote_member_id: "member-1",
        remote_user_id: "user-1",
        family_name: "우리 가족",
        child_name: "하루",
        child_birth_date: "2025-12-30",
        member_name: "이모",
        member_role: "family",
      },
      error: null,
    }));

    await expect(
      acceptRemoteFamilyInvite({ rpc } as unknown as SupabaseClient, {
        code: "A1B2C3D4",
        memberName: "이모",
      }),
    ).resolves.toEqual({
      remote_family_id: "family-1",
      remote_child_id: "child-1",
      remote_member_id: "member-1",
      remote_user_id: "user-1",
      family_name: "우리 가족",
      child_name: "하루",
      child_birth_date: "2025-12-30",
      member_name: "이모",
      member_role: "family",
    });
    expect(rpc).toHaveBeenCalledWith("accept_family_invite", {
      invite_code_input: "A1B2C3D4",
      member_name_input: "이모",
    });
  });

  it("throws when RPC returns an invalid response", async () => {
    const rpc = jest.fn(async () => ({
      data: { code: "A1B2C3D4" },
      error: null,
    }));

    await expect(
      createRemoteFamilyInvite({ rpc } as unknown as SupabaseClient, "family-1"),
    ).rejects.toThrow("원격 가족 초대 결과를 해석하지 못했습니다.");
  });

  it("lists pending remote family invites", async () => {
    const order = jest.fn(async () => ({
      data: [
        {
          invite_id: "invite-1",
          family_id: "family-1",
          code: "A1B2C3D4",
          expires_at: "2026-05-07T00:00:00.000Z",
          accepted_at: null,
          revoked_at: null,
          created_at: "2026-04-30T00:00:00.000Z",
        },
      ],
      error: null,
    }));
    const gt = jest.fn(() => ({ order }));
    const isRevokedAt = jest.fn(() => ({ gt }));
    const isAcceptedAt = jest.fn(() => ({ is: isRevokedAt }));
    const eq = jest.fn(() => ({ is: isAcceptedAt }));
    const select = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ select }));

    await expect(
      listPendingRemoteFamilyInvites(
        { from } as unknown as SupabaseClient,
        "family-1",
      ),
    ).resolves.toEqual([
      {
        invite_id: "invite-1",
        family_id: "family-1",
        code: "A1B2C3D4",
        expires_at: "2026-05-07T00:00:00.000Z",
        accepted_at: null,
        revoked_at: null,
        created_at: "2026-04-30T00:00:00.000Z",
      },
    ]);
    expect(from).toHaveBeenCalledWith("family_invites");
    expect(eq).toHaveBeenCalledWith("family_id", "family-1");
    expect(isAcceptedAt).toHaveBeenCalledWith("accepted_at", null);
    expect(isRevokedAt).toHaveBeenCalledWith("revoked_at", null);
    expect(gt).toHaveBeenCalledWith("expires_at", expect.any(String));
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("cancels a remote family invite through RPC", async () => {
    const rpc = jest.fn(async () => ({
      data: [
        {
          invite_id: "invite-1",
          family_id: "family-1",
          code: "A1B2C3D4",
          expires_at: "2026-05-07T00:00:00.000Z",
          accepted_at: null,
          revoked_at: "2026-04-30T00:00:00.000Z",
          created_at: "2026-04-30T00:00:00.000Z",
        },
      ],
      error: null,
    }));

    await expect(
      cancelRemoteFamilyInvite(
        { rpc } as unknown as SupabaseClient,
        "invite-1",
      ),
    ).resolves.toEqual({
      invite_id: "invite-1",
      family_id: "family-1",
      code: "A1B2C3D4",
      expires_at: "2026-05-07T00:00:00.000Z",
      accepted_at: null,
      revoked_at: "2026-04-30T00:00:00.000Z",
      created_at: "2026-04-30T00:00:00.000Z",
    });
    expect(rpc).toHaveBeenCalledWith("cancel_family_invite", {
      invite_id_input: "invite-1",
    });
  });
});
