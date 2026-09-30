import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { Observable } from 'rxjs';

import { operatingHours } from '@shared/models/settings/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http = inject(HttpClient);
  private settings = inject(APP_SETTINGS);

  private get baseUrl(): string {
    return `${this.settings.apiBaseUrl}/api/settings`;
  }

  getOperatingHours(): Observable<operatingHours> {
    return this.http.get<operatingHours>(`${this.baseUrl}/operating-hours`);
  }
}
