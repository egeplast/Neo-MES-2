/**
 * Siehe environment.ts für ausführliche OBO-Flow-Dokumentation.
 *
 * customScope MUSS auf den vom Backend exposten API-Scope zeigen,
 * damit der Frontend-Token per OBO-Flow im Backend gegen einen Graph-Token
 * getauscht werden kann.
 */
export const environment = {
  production: false,
  MSAL_me: 'https://graph.microsoft.com/v1.0/me',
  MSAL_clientId: '950d6ba9-2b71-4ab8-bc6d-988b9a6e425f',
  MSAL_authority: 'https://login.microsoftonline.com/aa814ea0-117a-4490-bfb2-b126a59c277c',
  MSAL_redirectUri: 'http://localhost:12001',
  MSAL_postLogoutRedirectUri: 'http://localhost:12001',
  MSAL_scopes: ['user.read'],
  MSAL_loginFailedRoute: '/',
  apiBaseUrl: 'http://localhost:12�010/api',
  /**
   * Format: api://{BACKEND_CLIENT_ID}/{SCOPE_NAME}
   * Beispiel: api://11111111-2222-3333-4444-555555555555/User.Read
   */
  customScope: 'api://placeholder-backend-client-id/User.Read',
};
