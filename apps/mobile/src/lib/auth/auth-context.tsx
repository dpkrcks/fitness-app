import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AuthResult,
  LoginInput,
  RegisterInput,
  ResendOtpInput,
  UserPublic,
  VerifyOtpInput,
} from '@fit/shared-types';
import { ApiError } from '../api';
import {
  getMe,
  login,
  logout,
  refreshTokens,
  register,
  resendOtp,
  verifyOtp,
} from './auth-api';
import { clearRefreshToken, getRefreshToken, saveRefreshToken } from './secure-store';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: UserPublic | null;
  signIn: (input: LoginInput) => Promise<void>;
  /** Create the account + trigger a verification code. Does NOT start a session. */
  signUp: (input: RegisterInput) => Promise<void>;
  /** Confirm an emailed code; on success the session begins. */
  verifyEmail: (input: VerifyOtpInput) => Promise<void>;
  /** Ask the API to send a fresh verification code. */
  resendCode: (input: ResendOtpInput) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Runs a protected request with the current access token, transparently
   * refreshing once on a 401 and retrying.
   */
  withFreshToken: <T>(fn: (accessToken: string) => Promise<T>) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Access token lives in memory only (a ref so it's always current, no re-render).
  const accessToken = useRef<string | null>(null);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Bootstrap: if a refresh token is persisted, exchange it for a live session.
  useEffect(() => {
    let active = true;
    (async () => {
      const stored = await getRefreshToken();
      if (!stored) {
        if (active) setStatus('unauthenticated');
        return;
      }
      try {
        const token = await refreshSession();
        const me = await getMe(token);
        if (active) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (active) setStatus('unauthenticated');
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshSession(): Promise<string> {
    const stored = await getRefreshToken();
    if (!stored) {
      await hardSignOut();
      throw new ApiError(401, 'NO_SESSION', 'No active session');
    }
    try {
      const tokens = await refreshTokens(stored);
      await saveRefreshToken(tokens.refreshToken);
      accessToken.current = tokens.accessToken;
      return tokens.accessToken;
    } catch (error) {
      // Refresh failed (expired/revoked/reuse) → drop the session.
      await hardSignOut();
      throw error;
    }
  }

  async function startSession(result: AuthResult): Promise<void> {
    await saveRefreshToken(result.tokens.refreshToken);
    accessToken.current = result.tokens.accessToken;
    setUser(result.user);
    setStatus('authenticated');
  }

  async function signIn(input: LoginInput): Promise<void> {
    await startSession(await login(input));
  }

  async function signUp(input: RegisterInput): Promise<void> {
    // Registration only creates the (unverified) account and sends a code; the
    // session starts later in verifyEmail once the code is confirmed.
    await register(input);
  }

  async function verifyEmail(input: VerifyOtpInput): Promise<void> {
    await startSession(await verifyOtp(input));
  }

  async function resendCode(input: ResendOtpInput): Promise<void> {
    await resendOtp(input);
  }

  async function hardSignOut(): Promise<void> {
    await clearRefreshToken();
    accessToken.current = null;
    setUser(null);
    setStatus('unauthenticated');
  }

  async function signOut(): Promise<void> {
    const stored = await getRefreshToken();
    if (stored) {
      try {
        await logout(stored);
      } catch {
        // Best-effort server revoke; we clear locally regardless.
      }
    }
    await hardSignOut();
  }

  async function withFreshToken<T>(fn: (accessToken: string) => Promise<T>): Promise<T> {
    if (!accessToken.current) {
      throw new ApiError(401, 'NO_SESSION', 'Not authenticated');
    }
    try {
      return await fn(accessToken.current);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const token = await refreshSession();
        return fn(token);
      }
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        signIn,
        signUp,
        verifyEmail,
        resendCode,
        signOut,
        withFreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
