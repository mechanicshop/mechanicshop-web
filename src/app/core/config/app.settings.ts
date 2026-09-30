import { InjectionToken } from '@angular/core';

import { environment } from '@Environments/environment';

import { normalizeBaseUrl } from '@shared/utils/utilities';

export interface AppSettings {
  appName: string;
  apiBaseUrl: string;
  isProduction: boolean;
  enableDevTools: boolean;
}

export const APP_SETTINGS = new InjectionToken<AppSettings>('APP_SETTINGS');

export const appSettings: AppSettings = {
  appName: environment.appName,
  apiBaseUrl: normalizeBaseUrl(environment.apiUrl),
  isProduction: environment.isProduction,
  enableDevTools: environment.enableDevTools,
};
