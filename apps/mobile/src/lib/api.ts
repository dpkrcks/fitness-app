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

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export function getHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health');
}
