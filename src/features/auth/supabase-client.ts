import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { readSupabaseConfig } from './supabase-config';

type CachedClient = {
  cacheKey: string;
  client: SupabaseClient;
};

let cachedClient: CachedClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = readSupabaseConfig();

  if (config.status === 'missing_config') {
    return null;
  }

  const cacheKey = `${config.url}:${config.anonKey}`;

  if (cachedClient?.cacheKey === cacheKey) {
    return cachedClient.client;
  }

  const client = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: AsyncStorage,
    },
  });

  cachedClient = {
    cacheKey,
    client,
  };

  return client;
}
