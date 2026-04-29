import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { getSupabaseClient } from './supabase-client';
import { readSupabaseConfig, type SupabaseConfig } from './supabase-config';

type AuthRequestStatus = 'idle' | 'loading';

export function useSupabaseAuth() {
  const config = useMemo<SupabaseConfig>(() => readSupabaseConfig(), []);
  const client = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requestStatus, setRequestStatus] =
    useState<AuthRequestStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (client === null) {
      return undefined;
    }

    let isActive = true;

    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (error !== null) {
          setErrorMessage(error.message);
          return;
        }

        setSession(data.session);
      })
      .catch(() => {
        if (isActive) {
          setErrorMessage('원격 계정 상태를 불러오지 못했습니다.');
        }
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const signIn = useCallback(async () => {
    if (client === null) {
      return;
    }

    const credentials = normalizeCredentials(email, password);

    if (credentials === null) {
      setErrorMessage('이메일과 비밀번호를 입력해 주세요.');
      setStatusMessage('');
      return;
    }

    setRequestStatus('loading');
    setErrorMessage('');
    setStatusMessage('');

    const { data, error } = await client.auth.signInWithPassword(credentials);

    setRequestStatus('idle');

    if (error !== null) {
      setErrorMessage(error.message);
      return;
    }

    setSession(data.session);
    setStatusMessage('원격 계정에 로그인했습니다.');
  }, [client, email, password]);

  const signUp = useCallback(async () => {
    if (client === null) {
      return;
    }

    const credentials = normalizeCredentials(email, password);

    if (credentials === null) {
      setErrorMessage('이메일과 비밀번호를 입력해 주세요.');
      setStatusMessage('');
      return;
    }

    setRequestStatus('loading');
    setErrorMessage('');
    setStatusMessage('');

    const { data, error } = await client.auth.signUp(credentials);

    setRequestStatus('idle');

    if (error !== null) {
      setErrorMessage(error.message);
      return;
    }

    setSession(data.session);
    setStatusMessage(
      data.session === null
        ? '가입 확인 메일을 보냈습니다.'
        : '원격 계정을 만들고 로그인했습니다.',
    );
  }, [client, email, password]);

  const signOut = useCallback(async () => {
    if (client === null) {
      return;
    }

    setRequestStatus('loading');
    setErrorMessage('');
    setStatusMessage('');

    const { error } = await client.auth.signOut();

    setRequestStatus('idle');

    if (error !== null) {
      setErrorMessage(error.message);
      return;
    }

    setSession(null);
    setStatusMessage('원격 계정에서 로그아웃했습니다.');
  }, [client]);

  return {
    config,
    email,
    errorMessage,
    isConfigured: client !== null,
    isLoading: requestStatus === 'loading',
    password,
    session,
    setEmail,
    setPassword,
    signIn,
    signOut,
    signUp,
    statusMessage,
  };
}

function normalizeCredentials(
  email: string,
  password: string,
): { email: string; password: string } | null {
  const normalizedEmail = email.trim();

  if (normalizedEmail.length === 0 || password.length === 0) {
    return null;
  }

  return {
    email: normalizedEmail,
    password,
  };
}
