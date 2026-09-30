import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { Observable } from 'rxjs';

import {
  createRepairTaskRequest,
  repairTask,
  updateRepairTaskRequest,
} from '@shared/models/repair-task/repair-task.model';

@Injectable({
  providedIn: 'root',
})
export class RepairTaskService {
  private http = inject(HttpClient);
  private settings = inject(APP_SETTINGS);

  private get baseUrl(): string {
    return `${this.settings.apiBaseUrl}/api/v1/repair-tasks`;
  }

  getRepairTasks(): Observable<repairTask[]> {
    return this.http.get<repairTask[]>(this.baseUrl);
  }

  getRepairTaskById(repairTaskId: string): Observable<repairTask> {
    return this.http.get<repairTask>(`${this.baseUrl}/${repairTaskId}`);
  }

  createRepairTask(request: createRepairTaskRequest): Observable<repairTask> {
    return this.http.post<repairTask>(this.baseUrl, request);
  }

  updateRepairTask(repairTaskId: string, request: updateRepairTaskRequest): Observable<repairTask> {
    return this.http.put<repairTask>(`${this.baseUrl}/${repairTaskId}`, request);
  }

  removeRepairTask(repairTaskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${repairTaskId}`);
  }
}
