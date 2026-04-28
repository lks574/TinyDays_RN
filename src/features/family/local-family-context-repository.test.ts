import { createDefaultFamilyContext } from "../../domain/family";
import { createLocalFamilyContextRepository } from "./local-family-context-repository";

function createMemoryStorage(initialValue: string | null = null) {
  let value = initialValue;

  return {
    getItem: jest.fn(async () => value),
    setItem: jest.fn(async (_key: string, nextValue: string) => {
      value = nextValue;
    }),
  };
}

describe("createLocalFamilyContextRepository", () => {
  const now = "2026-04-28T12:00:00.000Z";

  it("returns default context when storage is empty", async () => {
    const repository = createLocalFamilyContextRepository(createMemoryStorage());

    await expect(repository.getContext(now)).resolves.toMatchObject({
      family: { id: "local-family" },
      selected_child_id: "local-child",
      current_member: { role: "parent" },
    });
  });

  it("saves and loads a family context", async () => {
    const storage = createMemoryStorage();
    const repository = createLocalFamilyContextRepository(storage);
    const context = {
      ...createDefaultFamilyContext(now),
      family: {
        ...createDefaultFamilyContext(now).family,
        name: "튼튼 가족",
      },
    };

    await expect(repository.saveContext(context)).resolves.toEqual(context);
    await expect(repository.getContext(now)).resolves.toEqual(context);
    expect(storage.setItem).toHaveBeenCalledWith(
      "tinydays:family_context",
      JSON.stringify(context),
    );
  });

  it("recovers with default context when stored JSON is invalid", async () => {
    const repository = createLocalFamilyContextRepository(createMemoryStorage("{"));

    await expect(repository.getContext(now)).resolves.toMatchObject({
      family: { id: "local-family" },
      children: [{ id: "local-child" }],
    });
  });
});
