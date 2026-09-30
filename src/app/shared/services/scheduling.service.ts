import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { Observable } from 'rxjs';

import { schedule } from '@shared/models/scheduling/scheduling.model';
import { buildParameters } from '@shared/utils/utilities';

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private http = inject(HttpClient);
  private settings = inject(APP_SETTINGS);

  getDailySchedule(date: string, timezone: string, laborId: string | null): Observable<schedule> {
    const params = buildParameters({ laborId });
    const headers = { 'X-TimeZone': timezone };
    return this.http.get<schedule>(
      `${this.settings.apiBaseUrl}/api/v1/workorders/schedule/${date}`,
      { params, headers },
    );
  }
}
