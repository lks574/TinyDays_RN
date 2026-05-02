import {
  createDefaultFamilyContext,
  createRemoteFamilyBootstrapInput,
  createRemoteFamilyMapping,
  normalizeRemoteFamilyBootstrapResult,
  normalizeRemoteFamilyInvite,
  normalizeRemoteFamilyInvites,
  normalizeRemoteFamilyMembers,
  normalizeRemoteFamilyMapping,
} from ".";

const now = "2026-04-30T12:00:00.000Z";

describe("createRemoteFamilyBootstrapInput", () => {
  it("normalizes a local family context for remote bootstrap", () => {
    const context = createDefaultFamilyContext(now);

    expect(createRemoteFamilyBootstrapInput(context)).toEqual({
      family_name: "우리 가족",
      child_name: "하루",
      child_birth_date: "2025-12-30",
      member_name: "보호자",
    });
  });
});

describe("createRemoteFamilyMapping", () => {
  it("keeps local ids and remote UUIDs in a separate mapping", () => {
    const context = createDefaultFamilyContext(now);
    const mapping = createRemoteFamilyMapping(
      context,
      {
        remote_family_id: "10000000-0000-0000-0000-000000000015",
        remote_child_id: "30000000-0000-0000-0000-000000000015",
        remote_member_id: "20000000-0000-0000-0000-000000000015",
        remote_user_id: "00000000-0000-0000-0000-000000000015",
        family_name: "우리 가족",
        child_name: "하루",
        child_birth_date: "2025-12-30",
        member_name: "보호자",
        member_role: "parent",
      },
      now,
    );

    expect(mapping).toEqual({
      user_id: "00000000-0000-0000-0000-000000000015",
      local_family_id: "local-family",
      remote_family_id: "10000000-0000-0000-0000-000000000015",
      local_child_id: "local-child",
      remote_child_id: "30000000-0000-0000-0000-000000000015",
      local_member_id: "local-parent",
      remote_member_id: "20000000-0000-0000-0000-000000000015",
      bootstrapped_at: now,
      updated_at: now,
    });
  });
});

describe("remote family normalization", () => {
  it("rejects invalid mapping and bootstrap result values", () => {
    expect(normalizeRemoteFamilyMapping({ user_id: "user" })).toBeNull();
    expect(
      normalizeRemoteFamilyBootstrapResult({ member_role: "guardian" }),
    ).toBeNull();
  });

  it("normalizes remote family invite values", () => {
    expect(
      normalizeRemoteFamilyInvite({
        invite_id: "invite-1",
        family_id: "family-1",
        code: "A1B2C3D4",
        expires_at: "2026-05-07T00:00:00.000Z",
        accepted_at: null,
        revoked_at: null,
        created_at: "2026-04-30T00:00:00.000Z",
      }),
    ).toEqual({
      invite_id: "invite-1",
      family_id: "family-1",
      code: "A1B2C3D4",
      expires_at: "2026-05-07T00:00:00.000Z",
      accepted_at: null,
      revoked_at: null,
      created_at: "2026-04-30T00:00:00.000Z",
    });
    expect(normalizeRemoteFamilyInvite({ code: "A1B2C3D4" })).toBeNull();
  });

  it("normalizes remote family invite lists", () => {
    expect(
      normalizeRemoteFamilyInvites([
        {
          invite_id: "invite-1",
          family_id: "family-1",
          code: "A1B2C3D4",
          expires_at: "2026-05-07T00:00:00.000Z",
        },
      ]),
    ).toEqual([
      {
        invite_id: "invite-1",
        family_id: "family-1",
        code: "A1B2C3D4",
        expires_at: "2026-05-07T00:00:00.000Z",
      },
    ]);
    expect(normalizeRemoteFamilyInvites([{ code: "A1B2C3D4" }])).toBeNull();
  });

  it("normalizes remote family member values", () => {
    expect(
      normalizeRemoteFamilyMembers([
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
      ]),
    ).toEqual([
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
    expect(
      normalizeRemoteFamilyMembers([
        {
          id: "member-3",
          family_id: "family-1",
          user_id: "user-3",
          name: "관리자",
          role: "admin",
        },
      ]),
    ).toBeNull();
  });
});
