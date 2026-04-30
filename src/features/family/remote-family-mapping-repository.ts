import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  normalizeRemoteFamilyMapping,
  type RemoteFamilyMapping,
} from "../../domain/family";

type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const REMOTE_FAMILY_MAPPING_STORAGE_KEY_PREFIX =
  "tinydays:remote_family_mapping:";

export type RemoteFamilyMappingRepository = {
  getMapping: (userId: string) => Promise<RemoteFamilyMapping | null>;
  saveMapping: (mapping: RemoteFamilyMapping) => Promise<RemoteFamilyMapping>;
};

export function createRemoteFamilyMappingRepository(
  storage: KeyValueStorage = AsyncStorage,
): RemoteFamilyMappingRepository {
  return {
    async getMapping(userId) {
      const rawMapping = await storage.getItem(createStorageKey(userId));

      if (rawMapping === null) {
        return null;
      }

      try {
        const mapping = normalizeRemoteFamilyMapping(JSON.parse(rawMapping));

        return mapping?.user_id === userId ? mapping : null;
      } catch {
        return null;
      }
    },
    async saveMapping(mapping) {
      await storage.setItem(
        createStorageKey(mapping.user_id),
        JSON.stringify(mapping),
      );

      return mapping;
    },
  };
}

function createStorageKey(userId: string): string {
  return `${REMOTE_FAMILY_MAPPING_STORAGE_KEY_PREFIX}${userId}`;
}

export const remoteFamilyMappingRepository =
  createRemoteFamilyMappingRepository();
