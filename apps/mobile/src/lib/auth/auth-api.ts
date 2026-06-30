import type {
  AuthResult,
  AuthTokens,
  LoginInput,
  ProfileInput,
  ProfilePublic,
  RegisterInput,
  RegisterResult,
  ResendOtpInput,
  UserPublic,
  VerifyOtpInput,
} from '@fit/shared-types';
import { apiRequest } from '../api';

/** POST /auth/register — create an account and send a verification code. No tokens yet. */
export function register(input: RegisterInput): Promise<RegisterResult> {
  return apiRequest('/auth/register', { method: 'POST', body: input });
}

/** POST /auth/verify-otp — confirm the emailed code; this is where a session begins. */
export function verifyOtp(input: VerifyOtpInput): Promise<AuthResult> {
  return apiRequest('/auth/verify-otp', { method: 'POST', body: input });
}

/** POST /auth/resend-otp — request a fresh code (throttled + cooldown server-side). */
export function resendOtp(input: ResendOtpInput): Promise<void> {
  return apiRequest('/auth/resend-otp', { method: 'POST', body: input });
}

/** POST /auth/login — exchange credentials for a session. */
export function login(input: LoginInput): Promise<AuthResult> {
  return apiRequest('/auth/login', { method: 'POST', body: input });
}

/** POST /auth/refresh — rotate the refresh token into a new pair. */
export function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return apiRequest('/auth/refresh', { method: 'POST', body: { refreshToken } });
}

/** POST /auth/logout — revoke the refresh token. */
export function logout(refreshToken: string): Promise<void> {
  return apiRequest('/auth/logout', { method: 'POST', body: { refreshToken } });
}

/** GET /auth/me — the authenticated user (Bearer access token). */
export function getMe(accessToken: string): Promise<UserPublic> {
  return apiRequest('/auth/me', { token: accessToken });
}

/** GET /me/profile — the current user's profile (rejects with 404 if not set up). */
export function getProfile(accessToken: string): Promise<ProfilePublic> {
  return apiRequest('/me/profile', { token: accessToken });
}

/** POST /me/profile — create or complete the profile. */
export function saveProfile(
  accessToken: string,
  input: ProfileInput,
): Promise<ProfilePublic> {
  return apiRequest('/me/profile', { method: 'POST', body: input, token: accessToken });
}
