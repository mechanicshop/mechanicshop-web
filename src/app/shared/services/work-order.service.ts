import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { Observable } from 'rxjs';

import { PaginatedList } from '@shared/models/pagination/paginated-list.model';
import { PaginatedQuery } from '@shared/models/pagination/paginated-query.model';
import {
  assignLaborRequest,
  createWorkOrderRequest,
  modifyRepairTaskRequest,
  relocateWorkOrderRequest,
  updateWorkOrderStateRequest,
  workOrder,
  workOrderListItem,
  workOrderState,
  spot,
} from '@shared/models/work-order/work-order.model';
import { buildParameters } from '@shared/utils/utilities';

export interface WorkOrderQuery extends PaginatedQuery {
  sortColumn: string | null;
  sortDirection: string | null;
  state: workOrderState | null;
  vehicleId: string | null;
  laborId: string | null;
  startDate: string | null;
  endDate: string | null;
  spot: spot | null;
}

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  private http = inject(HttpClient);
  private settings = inject(APP_SETTINGS);

  private get baseUrl(): string {
    return `${this.settings.apiBaseUrl}/api/v1/workorders`;
  }

  getWorkOrderById(workOrderId: string): Observable<workOrder> {
    return this.http.get<workOrder>(`${this.baseUrl}/${workOrderId}`);
  }

  getWorkOrders(query: WorkOrderQuery): Observable<PaginatedList<workOrderListItem>> {
    const { pageNumber, ...rest } = query;
    const params = buildParameters({
      page: pageNumber,
      ...rest,
    });
    return this.http.get<PaginatedList<workOrderListItem>>(this.baseUrl, { params });
  }

  getCompletedWorkOrders(query: WorkOrderQuery): Observable<PaginatedList<workOrder>> {
    const { pageNumber, ...rest } = query;
    const params = buildParameters({
      page: pageNumber,
      ...rest,
    });
    return this.http.get<PaginatedList<workOrder>>(`${this.baseUrl}/completed`, { params });
  }

  assignLaborToWorkOrder(workOrderId: string, request: assignLaborRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${workOrderId}/labor`, request);
  }

  updateWorkOrderRepairTasks(
    workOrderId: string,
    request: modifyRepairTaskRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${workOrderId}/repair-task`, request);
  }

  deleteWorkOrder(workOrderId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${workOrderId}`);
  }

  updateWorkOrderState(
    workOrderId: string,
    request: updateWorkOrderStateRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${workOrderId}/state`, request);
  }

  relocateWorkOrder(workOrderId: string, request: relocateWorkOrderRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${workOrderId}/relocation`, request);
  }

  createWorkOrder(request: createWorkOrderRequest): Observable<workOrder> {
    return this.http.post<workOrder>(this.baseUrl, request);
  }
}
