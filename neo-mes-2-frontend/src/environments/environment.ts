/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MSAL + On-Behalf-Of (OBO) FLOW — WICHTIG
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Damit der Backend Graph-Service die Benutzer-Identität weiterreichen kann,
 * muss das Frontend einen Access-Token für den BACKEND-API-Scope anfordern —
 * NICHT für Microsoft Graph direkt. Das Backend tauscht diesen Token dann
 * per OBO-Flow gegen einen Graph-Token.
 *
 * Setup in Azure Portal:
 *
 * 1. BACKEND App Registration:
 *      → "Expose an API" → Application ID URI setzen:
 *           api://{BACKEND_CLIENT_ID}
 *      → "Add a scope" → Scope Name: User.Read (oder passend)
 *           Consent: Admins and users
 *      → "Authorized client applications" → Frontend Client ID hinzufügen
 *           mit dem eben angelegten Scope
 *
 * 2. FRONTEND App Registration:
 *      → "API permissions" → Add permission → My APIs
 *           → Backend App auswählen → Scope User.Read hinzufügen
 *      → Grant admin consent
 *
 * 3. customScope hier unten setzen auf:
 *      api://{BACKEND_CLIENT_ID}/User.Read
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const environment = {
  production: false,
  MSAL_me: "",
  MSAL_clientId: "950d6ba9-2b71-4ab8-bc6d-988b9a6e425f",
  MSAL_authority:
    "https://login.microsoftonline.com/aa814ea0-117a-4490-bfb2-b126a59c277c",
  MSAL_redirectUri: "http://localhost:12001",
  MSAL_postLogoutRedirectUri: "http://localhost:12001",
  MSAL_scopes: [""],
  MSAL_loginFailedRoute: "/",
  apiBaseUrl: "",
  /**
   * API-Scope des BACKENDS (für OBO-Flow zwingend erforderlich).
   * Format: api://{BACKEND_CLIENT_ID}/{SCOPE_NAME}
   */
  customScope: "",
};
