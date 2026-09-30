import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { Observable } from 'rxjs';

import {
  appUser,
  generateTokenQuery,
  refreshTokenQuery,
  tokenResponse,
} from '@shared/models/identity/identity.model';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  private http = inject(HttpClient);
  private settings = inject(APP_SETTINGS);

  private get baseUrl(): string {
    return `${this.settings.apiBaseUrl}/api/v1/identity`;
  }

  generateToken(request: generateTokenQuery): Observable<tokenResponse> {
    return this.http.post<tokenResponse>(`${this.baseUrl}/token/generate`, request);
  }

  refreshToken(request: refreshTokenQuery): Observable<tokenResponse> {
    return this.http.post<tokenResponse>(`${this.baseUrl}/token/refresh-token`, request);
  }

  getCurrentUserClaims(): Observable<appUser> {
    return this.http.get<appUser>(`${this.baseUrl}/current-user/claims`);
  }
}
