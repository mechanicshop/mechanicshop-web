import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { map, Observable, switchMap, tap } from 'rxjs';

import { appUser, tokenResponse } from '@shared/models/identity/identity.model';
import { IdentityService } from '@shared/services/identity.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly appSettings = inject(APP_SETTINGS);
  private readonly identityService = inject(IdentityService);
  private readonly platformId = inject(PLATFORM_ID);
  private _currentUser = signal<appUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'current_user';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
    }
  }

  login(credentials: { email: string; password: string }): Observable<appUser> {
    return this.identityService
      .generateToken({
        email: credentials.email,
        password: credentials.password,
      })
      .pipe(
        tap((response) => {
          if (response.accessToken && isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, response.accessToken);
          }
        }),
        switchMap(() => this.identityService.getCurrentUserClaims()),
        tap((user) => this.persistUser(user)),
      );
  }

  refreshAccessToken(expiredAccessToken: string): Observable<string> {
    return this.http
      .post<tokenResponse>(
        `${this.appSettings.apiBaseUrl}/api/v1/identity/token/refresh-token`,
        { expiredAccessToken },
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.accessToken),
        tap((accessToken) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, accessToken);
          }
        }),
      );
  }

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.tokenKey);
  }

  clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this._currentUser.set(null);
  }

  private persistUser(user: appUser): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    this._currentUser.set(user);
  }

  private restoreSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.userKey);

    if (!token || !storedUser) {
      this.clearSession();
      return;
    }

    try {
      const user = JSON.parse(storedUser) as appUser;
      this._currentUser.set(user);
    } catch {
      this.clearSession();
    }
  }
}
