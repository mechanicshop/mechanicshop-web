import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@StoreFeatures/with-request-status.feature';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

import { schedule } from '@shared/models/scheduling/scheduling.model';
import {
  assignLaborRequest,
  createWorkOrderRequest,
  modifyRepairTaskRequest,
  relocateWorkOrderRequest,
  updateWorkOrderStateRequest,
} from '@shared/models/work-order/work-order.model';
import { SchedulingService } from '@shared/services/scheduling.service';
import { WorkOrderService } from '@shared/services/work-order.service';
import { getApiErrorMessage } from '@shared/utils/utilities';

export interface DailyScheduleState {
  date: Date | null;
  laborId: string | null;
  schedule: schedule | null;
}

const initialState: DailyScheduleState = {
  date: null,
  laborId: null,
  schedule: null,
};

export const ScheduleStore = signalStore(
  withState<DailyScheduleState>(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      schedulingService = inject(SchedulingService),
      workOrderService = inject(WorkOrderService),
      snackBar = inject(MatSnackBar),
    ) => {
      const fetchSchedule = rxMethod<{ date: Date; laborId: string | null }>(
        pipe(
          tap(() => patchState(store, setPending('load-date'))),
          switchMap(({ date, laborId }) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            return schedulingService.getDailySchedule(dateStr, timezone, laborId).pipe(
              tap((res) => {
                patchState(store, { schedule: res });
                patchState(store, setFulfilled('load-date'));
              }),
              catchError((err) => {
                const errMsg = getApiErrorMessage(err, 'Failed to load schedule');
                patchState(store, setError('load-date', errMsg));
                return of(null);
              }),
            );
          }),
        ),
      );

      return {
        load(date: Date, laborId: string | null = null): void {
          const currentLabor = laborId ?? store.laborId();
          patchState(store, { date, laborId: currentLabor });
          fetchSchedule({ date, laborId: currentLabor });
        },
        setLabor(laborId: string | null): void {
          const currentDate = store.date();
          if (currentDate) {
            patchState(store, { laborId });
            fetchSchedule({ date: currentDate, laborId });
          }
        },
        createWorkOrder(request: createWorkOrderRequest): void {
          patchState(store, setPending('create-workorder'));
          workOrderService.createWorkOrder(request).subscribe({
            next: () => {
              patchState(store, setFulfilled('create-workorder'));
              snackBar.open('Work order created successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });
              const currentDate = store.date();
              if (currentDate) {
                fetchSchedule({ date: currentDate, laborId: store.laborId() });
              }
            },
            error: (err) => {
              const errMsg = getApiErrorMessage(err, 'Failed to create work order');
              patchState(store, setError('create-workorder', errMsg));
              snackBar.open(errMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
            },
          });
        },
        relocateWorkOrder(workOrderId: string, request: relocateWorkOrderRequest): void {
          patchState(store, setPending('relocate-workorder'));
          workOrderService.relocateWorkOrder(workOrderId, request).subscribe({
            next: () => {
              patchState(store, setFulfilled('relocate-workorder'));
              snackBar.open('Work order relocated successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });
              const currentDate = store.date();
              if (currentDate) {
                fetchSchedule({ date: currentDate, laborId: store.laborId() });
              }
            },
            error: (err) => {
              const errMsg = getApiErrorMessage(err, 'Failed to relocate work order');
              patchState(store, setError('relocate-workorder', errMsg));
              snackBar.open(errMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
            },
          });
        },
        reassignLabor(workOrderId: string, request: assignLaborRequest): void {
          patchState(store, setPending('reassign-labor'));
          workOrderService.assignLaborToWorkOrder(workOrderId, request).subscribe({
            next: () => {
              patchState(store, setFulfilled('reassign-labor'));
              snackBar.open('Labor reassigned successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });
              const currentDate = store.date();
              if (currentDate) {
                fetchSchedule({ date: currentDate, laborId: store.laborId() });
              }
            },
            error: (err) => {
              const errMsg = getApiErrorMessage(err, 'Failed to reassign labor');
              patchState(store, setError('reassign-labor', errMsg));
              snackBar.open(errMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
            },
          });
        },
        modifyWorkOrderTasks(workOrderId: string, request: modifyRepairTaskRequest): void {
          patchState(store, setPending('modify-tasks'));
          workOrderService.updateWorkOrderRepairTasks(workOrderId, request).subscribe({
            next: () => {
              patchState(store, setFulfilled('modify-tasks'));
              snackBar.open('Work order tasks modified successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });
              const currentDate = store.date();
              if (currentDate) {
                fetchSchedule({ date: currentDate, laborId: store.laborId() });
              }
            },
            error: (err) => {
              const errMsg = getApiErrorMessage(err, 'Failed to modify tasks');
              patchState(store, setError('modify-tasks', errMsg));
              snackBar.open(errMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
            },
          });
        },
        deleteWorkOrder(workOrderId: string): void {
          patchState(store, setPending('delete-workorder'));
          workOrderService.deleteWorkOrder(workOrderId).subscribe({
            next: () => {
              patchState(store, setFulfilled('delete-workorder'));
              snackBar.open('Work order deleted successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });
              const currentDate = store.date();
              if (currentDate) {
                fetchSchedule({ date: currentDate, laborId: store.laborId() });
              }
            },
            error: (err) => {
              const errMsg = getApiErrorMessage(err, 'Failed to delete work order');
              patchState(store, setError('delete-workorder', errMsg));
              snackBar.open(errMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
            },
          });
        },
        updateWorkOrderState(workOrderId: string, request: updateWorkOrderStateRequest): void {
          patchState(store, setPending('update-state'));
          workOrderService.updateWorkOrderState(workOrderId, request).subscribe({
            next: () => {
              patchState(store, setFulfilled('update-state'));
              snackBar.open('Work order state updated successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });
              const currentDate = store.date();
              if (currentDate) {
                fetchSchedule({ date: currentDate, laborId: store.laborId() });
              }
            },
            error: (err) => {
              const errMsg = getApiErrorMessage(err, 'Failed to update state');
              patchState(store, setError('update-state', errMsg));
              snackBar.open(errMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
            },
          });
        },
      };
    },
  ),
);
