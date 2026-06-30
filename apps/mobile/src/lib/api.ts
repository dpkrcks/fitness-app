import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * The NestJS API listens on port 3000 and serves everything under the
 * `/api/v1` global prefix.
 */
const API_PORT = 3000;
const API_PREFIX = '/api/v1';

/**
 * Resolve the API base URL for the current runtime, in precedence order:
 *
 *  1. `EXPO_PUBLIC_API_URL` — explicit override for staging/prod or a custom host.
 *  2. Web — the bundler and API share `localhost`.
 *  3. Native dev — derive the dev machine's LAN IP from Expo's `hostUri`
 *     (e.g. "192.168.1.5:8081"). A physical device must reach the *computer*
 *     running the API, not its own loopback, so we reuse the host Expo is
 *     already serving the bundle from.
 *  4. Fallback — localhost (or the Android emulator's host-loopback alias).
 */
function resolveApiBaseUrl(): string {
  const override = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (override) return override.replace(/\/+$/, '');

  if (Platform.OS === 'web') {
    return `http://localhost:${API_PORT}${API_PREFIX}`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? '';
  const lanHost = hostUri.split(':')[0];
  if (lanHost) return `http://${lanHost}:${API_PORT}${API_PREFIX}`;

  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${fallbackHost}:${API_PORT}${API_PREFIX}`;
}

export const API_BASE_URL = resolveApiBaseUrl();

/** Shape returned by `GET /api/v1/health` (liveness). */
export type HealthResponse = {
  status: 'ok';
  timestamp: string;
};

/** Uniform error body the API returns: `{ code, message, details? }`. */
export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

/** Thrown for any non-2xx API response; carries the parsed error body. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Bearer access token for protected routes. */
  token?: string | null;
};

/**
 * Single fetch wrapper for the API: serializes JSON, attaches the bearer token,
 * and normalizes errors into `ApiError`. 204 responses resolve to `undefined`.
 */
export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const err = (data ?? {}) as Partial<ApiErrorBody>;
    throw new ApiError(
      response.status,
      err.code ?? 'UNKNOWN',
      err.message ?? response.statusText,
      err.details,
    );
  }
  return data as T;
}

export function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}
