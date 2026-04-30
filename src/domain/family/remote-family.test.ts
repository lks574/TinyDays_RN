import {
  createDefaultFamilyContext,
  createRemoteFamilyBootstrapInput,
  createRemoteFamilyMapping,
  normalizeRemoteFamilyBootstrapResult,
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
});
