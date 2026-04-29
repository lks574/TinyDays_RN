import {
  SUPABASE_ANON_KEY_ENV_KEY,
  SUPABASE_URL_ENV_KEY,
  readSupabaseConfig,
} from './supabase-config';

describe('readSupabaseConfig', () => {
  it('returns configured Supabase config from Expo public env', () => {
    expect(
      readSupabaseConfig({
        [SUPABASE_URL_ENV_KEY]: 'https://example.supabase.co',
        [SUPABASE_ANON_KEY_ENV_KEY]: 'anon-key',
      }),
    ).toEqual({
      status: 'configured',
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    });
  });

  it('reports missing keys when env values are empty', () => {
    expect(readSupabaseConfig({})).toEqual({
      status: 'missing_config',
      missingKeys: [SUPABASE_URL_ENV_KEY, SUPABASE_ANON_KEY_ENV_KEY],
    });
  });

  it('requires an HTTP Supabase URL', () => {
    expect(
      readSupabaseConfig({
        [SUPABASE_URL_ENV_KEY]: 'not-a-url',
        [SUPABASE_ANON_KEY_ENV_KEY]: 'anon-key',
      }),
    ).toEqual({
      status: 'missing_config',
      missingKeys: [SUPABASE_URL_ENV_KEY],
    });
  });
});
