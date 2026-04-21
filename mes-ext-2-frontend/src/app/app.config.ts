import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
  MsalService,
} from '@azure/msal-angular';
import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication,
} from '@azure/msal-browser';

import { environment } from '../environments/environment';

registerLocaleData(localeDe);

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.MSAL_clientId,
      authority: environment.MSAL_authority,
      redirectUri: environment.MSAL_redirectUri,
      postLogoutRedirectUri: environment.MSAL_postLogoutRedirectUri,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      allowRedirectInIframe: true,
      tokenRenewalOffsetSeconds: 300,
    },
  });
}

/**
 * Der Interceptor hängt automatisch das passende Token an ausgehende Requests:
 *  - Requests an Microsoft Graph (MSAL_me) bekommen Graph-Scopes.
 *  - Requests an das eigene Backend (apiBaseUrl) bekommen den customScope —
 *    zwingend erforderlich, damit das Backend per OBO-Flow einen Graph-Token
 *    anfordern kann.
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(environment.MSAL_me, environment.MSAL_scopes);
  if (environment.apiBaseUrl && environment.customScope) {
    protectedResourceMap.set(environment.apiBaseUrl, [environment.customScope]);
  }
  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: environment.MSAL_scopes,
    },
    loginFailedRoute: environment.MSAL_loginFailedRoute,
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory },
    { provide: LOCALE_ID, useValue: 'de-DE' },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
  ],
};
