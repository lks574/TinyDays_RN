import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  normalizeFamilyContext,
  type FamilyContext,
} from "../../domain/family";

type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const FAMILY_CONTEXT_STORAGE_KEY = "tinydays:family_context";

export type FamilyContextRepository = {
  getContext: (now: string) => Promise<FamilyContext>;
  saveContext: (context: FamilyContext) => Promise<FamilyContext>;
};

export function createLocalFamilyContextRepository(
  storage: KeyValueStorage = AsyncStorage,
): FamilyContextRepository {
  return {
    async getContext(now) {
      const rawContext = await storage.getItem(FAMILY_CONTEXT_STORAGE_KEY);

      if (rawContext === null) {
        return normalizeFamilyContext(null, now);
      }

      try {
        return normalizeFamilyContext(JSON.parse(rawContext), now);
      } catch {
        return normalizeFamilyContext(null, now);
      }
    },
    async saveContext(context) {
      await storage.setItem(FAMILY_CONTEXT_STORAGE_KEY, JSON.stringify(context));

      return context;
    },
  };
}

export const localFamilyContextRepository =
  createLocalFamilyContextRepository();
