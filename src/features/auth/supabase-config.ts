export const SUPABASE_URL_ENV_KEY = 'EXPO_PUBLIC_SUPABASE_URL';
export const SUPABASE_ANON_KEY_ENV_KEY = 'EXPO_PUBLIC_SUPABASE_ANON_KEY';

type SupabaseEnv = Record<string, string | undefined>;

export type SupabaseConfig =
  | {
      status: 'configured';
      url: string;
      anonKey: string;
    }
  | {
      status: 'missing_config';
      missingKeys: string[];
    };

declare const process:
  | {
      env?: SupabaseEnv;
    }
  | undefined;

export function readSupabaseConfig(
  env: SupabaseEnv = process?.env ?? {},
): SupabaseConfig {
  const url = normalizeEnvValue(env[SUPABASE_URL_ENV_KEY]);
  const anonKey = normalizeEnvValue(env[SUPABASE_ANON_KEY_ENV_KEY]);
  const missingKeys: string[] = [];

  if (url === null || !isValidHttpUrl(url)) {
    missingKeys.push(SUPABASE_URL_ENV_KEY);
  }

  if (anonKey === null) {
    missingKeys.push(SUPABASE_ANON_KEY_ENV_KEY);
  }

  if (missingKeys.length > 0) {
    return {
      status: 'missing_config',
      missingKeys,
    };
  }

  return {
    status: 'configured',
    url: url as string,
    anonKey: anonKey as string,
  };
}

function normalizeEnvValue(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
