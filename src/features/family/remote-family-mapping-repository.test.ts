import type { RemoteFamilyMapping } from "../../domain/family";
import { createRemoteFamilyMappingRepository } from "./remote-family-mapping-repository";

function createMemoryStorage(initialValue: string | null = null) {
  let value = initialValue;

  return {
    getItem: jest.fn(async () => value),
    setItem: jest.fn(async (_key: string, nextValue: string) => {
      value = nextValue;
    }),
  };
}

const mapping: RemoteFamilyMapping = {
  user_id: "00000000-0000-0000-0000-000000000015",
  local_family_id: "local-family",
  remote_family_id: "10000000-0000-0000-0000-000000000015",
  local_child_id: "local-child",
  remote_child_id: "30000000-0000-0000-0000-000000000015",
  local_member_id: "local-parent",
  remote_member_id: "20000000-0000-0000-0000-000000000015",
  bootstrapped_at: "2026-04-30T12:00:00.000Z",
  updated_at: "2026-04-30T12:00:00.000Z",
};

describe("createRemoteFamilyMappingRepository", () => {
  it("saves and loads a mapping by user id", async () => {
    const storage = createMemoryStorage();
    const repository = createRemoteFamilyMappingRepository(storage);

    await expect(repository.saveMapping(mapping)).resolves.toEqual(mapping);
    await expect(repository.getMapping(mapping.user_id)).resolves.toEqual(
      mapping,
    );
    expect(storage.setItem).toHaveBeenCalledWith(
      `tinydays:remote_family_mapping:${mapping.user_id}`,
      JSON.stringify(mapping),
    );
  });

  it("returns null when stored JSON is invalid", async () => {
    const repository = createRemoteFamilyMappingRepository(
      createMemoryStorage("{"),
    );

    await expect(repository.getMapping(mapping.user_id)).resolves.toBeNull();
  });

  it("returns null when the stored mapping belongs to a different user", async () => {
    const repository = createRemoteFamilyMappingRepository(
      createMemoryStorage(JSON.stringify(mapping)),
    );

    await expect(repository.getMapping("other-user")).resolves.toBeNull();
  });
});
