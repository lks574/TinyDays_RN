import {
  calculateDayCount,
  createDefaultFamilyContext,
  getLogOwnerContext,
  normalizeFamilyContext,
} from "./family";

const now = "2026-04-28T12:00:00.000Z";

describe("createDefaultFamilyContext", () => {
  it("creates a local family with one child and parent role", () => {
    const context = createDefaultFamilyContext(now);

    expect(context.family.id).toBe("local-family");
    expect(context.children).toHaveLength(1);
    expect(context.selected_child_id).toBe("local-child");
    expect(context.current_member.role).toBe("parent");
  });
});

describe("normalizeFamilyContext", () => {
  it("recovers invalid stored values with a default context", () => {
    const context = normalizeFamilyContext({ family: null }, now);

    expect(context.family.id).toBe("local-family");
    expect(context.children[0].id).toBe("local-child");
  });

  it("uses the first child when selected child id is missing", () => {
    const storedContext = {
      ...createDefaultFamilyContext(now),
      selected_child_id: "missing-child",
    };
    const context = normalizeFamilyContext(storedContext, now);

    expect(context.selected_child_id).toBe("local-child");
  });
});

describe("getLogOwnerContext", () => {
  it("returns ids needed to create baby logs", () => {
    const context = createDefaultFamilyContext(now);

    expect(getLogOwnerContext(context)).toEqual({
      child_id: "local-child",
      family_id: "local-family",
      created_by: "local-parent",
    });
  });
});

describe("calculateDayCount", () => {
  it("calculates inclusive D day count from birth date", () => {
    expect(calculateDayCount("2025-12-30", now)).toBe(120);
  });

  it("returns null for invalid or future birth dates", () => {
    expect(calculateDayCount("invalid", now)).toBeNull();
    expect(calculateDayCount("2026-04-29", now)).toBeNull();
  });
});
