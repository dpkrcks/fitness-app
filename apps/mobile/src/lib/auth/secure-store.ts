import * as SecureStore from 'expo-secure-store';

/**
 * The refresh token is the only credential persisted on-device. It lives in the
 * platform Keychain/Keystore via expo-secure-store; the short-lived access
 * token is kept in memory only. Key chars are limited to [A-Za-z0-9._-].
 */
const REFRESH_TOKEN_KEY = 'fit.refreshToken';

export function saveRefreshToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export function clearRefreshToken(): Promise<void> {
  return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
