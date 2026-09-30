import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { Observable } from 'rxjs';

import { todayWorkOrderStats } from '@shared/models/dashboard/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private settings = inject(APP_SETTINGS);

  private get baseUrl(): string {
    return `${this.settings.apiBaseUrl}/api/v1/dashboard`;
  }

  getWorkOrderStats(): Observable<todayWorkOrderStats> {
    return this.http.get<todayWorkOrderStats>(`${this.baseUrl}/stats`);
  }
}
