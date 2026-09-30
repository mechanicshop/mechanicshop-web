import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { Observable } from 'rxjs';

import { labor } from '@shared/models/labor/labor.model';

@Injectable({
  providedIn: 'root',
})
export class LaborService {
  private http = inject(HttpClient);
  private settings = inject(APP_SETTINGS);

  private get baseUrl(): string {
    return `${this.settings.apiBaseUrl}/api/v1/labors`;
  }

  getLabors(): Observable<labor[]> {
    return this.http.get<labor[]>(this.baseUrl);
  }
}
