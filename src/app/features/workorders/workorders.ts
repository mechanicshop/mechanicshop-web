import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { debounceTime, startWith } from 'rxjs/operators';

import { OperationFailed } from '@shared/components/operation-failed';
import { PageHeader } from '@shared/components/page-header';
import { workOrderState } from '@shared/models/work-order/work-order.model';
import { WorkOrderService } from '@shared/services/work-order.service';

interface FilterFormGroup {
  name: FormControl<string>;
  startDate: FormControl<Date | string | null>;
  endDate: FormControl<Date | string | null>;
  state: FormControl<string>;
}

@Component({
  selector: 'app-work-orders',
  standalone: true,
  imports: [
    PageHeader,
    OperationFailed,
    MatProgressSpinner,
    MatButtonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    CurrencyPipe,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div>
      <main class="container page-layout">
        <app-page-header>
          <h1>Work Orders</h1>
          <p>Monitor shop work orders, schedules, states, and details.</p>
        </app-page-header>

        <form class="filter-bar" [formGroup]="filterForm">
          <mat-form-field class="filter-field search-field" appearance="outline">
            <mat-label>Search Customer or Vehicle</mat-label>
            <input
              [formControl]="filterForm.controls.name"
              matInput
              placeholder="Type customer name, make, model or plate..."
            />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field class="filter-field date-field" appearance="outline">
            <mat-label>Start Date</mat-label>
            <input [matDatepicker]="startPicker" [formControl]="startDateControl" matInput />
            <mat-datepicker-toggle [for]="startPicker" matIconSuffix></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field class="filter-field date-field" appearance="outline">
            <mat-label>End Date</mat-label>
            <input [matDatepicker]="endPicker" [formControl]="endDateControl" matInput />
            <mat-datepicker-toggle [for]="endPicker" matIconSuffix></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field class="filter-field status-field" appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="stateControl">
              <mat-option value="">All Statuses</mat-option>
              <mat-option [value]="stateEnum.Scheduled">Scheduled</mat-option>
              <mat-option [value]="stateEnum.InProgress">In Progress</mat-option>
              <mat-option [value]="stateEnum.Completed">Completed</mat-option>
              <mat-option [value]="stateEnum.Cancelled">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>
        </form>

        @if (isLoading()) {
          <div class="loading-container">
            <mat-progress-spinner mode="indeterminate" diameter="48" />
            <span class="loading-text">Loading work orders...</span>
          </div>
        } @else if (error()) {
          <app-operation-failed
            [title]="'Failed to load work orders'"
            [message]="'Could not connect to the backend server. Please verify your connection.'"
            (retry)="workOrdersResource.reload()"
          />
        } @else {
          <div class="table-card">
            <table class="workorders-table" [dataSource]="dataSource()" mat-table>
              <ng-container matColumnDef="name">
                <th *matHeaderCellDef mat-header-cell>Work Order Info</th>
                <td *matCellDef="let element" mat-cell>
                  <div class="info-cell">
                    <span class="customer-name">{{ element.customer || 'Unknown Customer' }}</span>
                    <span class="vehicle-desc">
                      {{ element.vehicle?.make }} {{ element.vehicle?.model }} ({{
                        element.vehicle?.year
                      }})
                    </span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="tasks">
                <th *matHeaderCellDef mat-header-cell>Repair Tasks</th>
                <td *matCellDef="let element" mat-cell>
                  <div class="tasks-cell-content">
                    @for (task of element.repairTasks; track task) {
                      <span class="task-badge">{{ task }}</span>
                    } @empty {
                      <span class="empty-text">No tasks</span>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="start">
                <th *matHeaderCellDef mat-header-cell>Start Date</th>
                <td *matCellDef="let element" mat-cell>
                  {{ element.startAtUtc | date: 'MMM d, y, h:mm a' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="end">
                <th *matHeaderCellDef mat-header-cell>End Date</th>
                <td *matCellDef="let element" mat-cell>
                  {{ element.endAtUtc | date: 'MMM d, y, h:mm a' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th *matHeaderCellDef mat-header-cell>Status</th>
                <td *matCellDef="let element" mat-cell>
                  <span class="status-badge" [class]="getStatusClass(element.state)">
                    {{ getStatusLabel(element.state) }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="total">
                <th *matHeaderCellDef mat-header-cell>Total & Payment</th>
                <td *matCellDef="let element" mat-cell>
                  <div class="total-cell-content">
                    <span class="total-cost-val">{{ element.totalCost | currency }}</span>
                    <span
                      class="payment-badge"
                      [class]="getPaymentStatusClass(element.paymentStatus)"
                    >
                      {{ element.paymentStatus || 'Pending' }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th class="actions-header" *matHeaderCellDef mat-header-cell>Actions</th>
                <td class="actions-cell" *matCellDef="let element" mat-cell>
                  <button
                    class="details-btn"
                    [routerLink]="['/workorders', element.workOrderId]"
                    mat-stroked-button
                    color="primary"
                  >
                    Details
                  </button>
                </td>
              </ng-container>

              <tr *matHeaderRowDef="displayedColumns" mat-header-row></tr>
              <tr class="table-row" *matRowDef="let row; columns: displayedColumns" mat-row></tr>
            </table>

            @if (dataSource().length === 0) {
              <div class="empty-table-state">
                <mat-icon class="empty-icon">assignment_late</mat-icon>
                <h3>No work orders found</h3>
                <p>Try refining your search terms or date range filters.</p>
              </div>
            }

            <mat-paginator
              class="paginator"
              [length]="totalCount()"
              [pageSize]="pageSize()"
              [pageIndex]="pageIndex()"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (page)="onPageChange($event)"
              aria-label="Select page of work orders"
            >
            </mat-paginator>
          </div>
        }
      </main>
    </div>
  `,
  styles: `
    .page-layout {
      padding-block: 2rem;
    }

    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1rem;
      margin-bottom: 1.5rem;
      align-items: center;
    }

    .filter-field {
      flex: 1 1 200px;
    }

    .search-field {
      flex: 2 1 300px;
    }

    .date-field {
      max-width: 220px;
    }

    .status-field {
      max-width: 180px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      gap: 1rem;
      color: var(--color-muted);
    }

    .loading-text {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .table-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .workorders-table {
      width: 100%;
      background: transparent;
      border-collapse: collapse;
    }

    .table-row {
      transition: background-color 0.2s var(--ease-spring);

      &:hover {
        background-color: var(--color-outline-variant);
      }
    }

    .info-cell {
      display: flex;
      flex-direction: column;
      padding-block: 0.5rem;
    }

    .customer-name {
      font-weight: 600;
      color: var(--color-ink);
      font-size: 0.95rem;
    }

    .vehicle-desc {
      font-size: 0.8rem;
      color: var(--color-muted);
      margin-top: 0.15rem;
    }

    .status-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-scheduled {
      background-color: rgba(181, 137, 0, 0.1);
      color: var(--color-warning);
    }

    .status-inprogress {
      background-color: rgba(230, 92, 0, 0.1);
      color: var(--color-primary);
    }

    .status-completed {
      background-color: rgba(27, 138, 90, 0.1);
      color: var(--color-success);
    }

    .status-cancelled {
      background-color: rgba(198, 40, 40, 0.1);
      color: var(--color-danger);
    }

    .actions-header {
      text-align: right !important;
      padding-right: 1.5rem !important;
    }

    .actions-cell {
      text-align: right;
      padding-right: 1.5rem !important;
    }

    .details-btn {
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--radius-md);
      transition:
        background-color 0.2s var(--ease-spring),
        border-color 0.2s var(--ease-spring);

      &:hover {
        background-color: var(--color-primary-container);
        border-color: var(--color-primary);
      }
    }

    .tasks-cell-content {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      max-width: 250px;
    }

    .task-badge {
      font-size: 0.75rem;
      background-color: var(--color-outline-variant);
      color: var(--color-ink);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      font-weight: 500;
    }

    .total-cell-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      padding-block: 0.5rem;
    }

    .total-cost-val {
      font-weight: 700;
      color: var(--color-ink);
      font-size: 0.95rem;
    }

    .payment-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .payment-paid {
      background-color: rgba(27, 138, 90, 0.1);
      color: var(--color-success);
    }

    .payment-unpaid {
      background-color: rgba(198, 40, 40, 0.1);
      color: var(--color-danger);
    }

    .payment-pending {
      background-color: rgba(140, 140, 140, 0.1);
      color: var(--color-muted);
    }

    .empty-text {
      font-size: 0.8rem;
      color: var(--color-muted);
      font-style: italic;
    }

    .empty-table-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: var(--color-muted);
      border-bottom: 1px solid var(--color-outline-variant);

      .empty-icon {
        font-size: 3rem;
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
      }

      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        color: var(--color-ink);
      }

      p {
        font-size: 0.875rem;
        margin-top: 0.25rem;
        max-width: 320px;
      }
    }

    .paginator {
      background: transparent;
      border-top: 1px solid var(--color-outline-variant);
    }
  `,
})
export class WorkOrders {
  private readonly workOrderService = inject(WorkOrderService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly stateEnum = workOrderState;
  protected readonly displayedColumns: string[] = [
    'name',
    'tasks',
    'start',
    'end',
    'status',
    'total',
    'actions',
  ];

  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected get nameControl() {
    return this.filterForm.controls.name;
  }

  protected get startDateControl() {
    return this.filterForm.controls.startDate;
  }

  protected get endDateControl() {
    return this.filterForm.controls.endDate;
  }

  protected get stateControl() {
    return this.filterForm.controls.state;
  }

  protected readonly filterForm: FormGroup<FilterFormGroup> = this.fb.group<FilterFormGroup>({
    name: this.fb.control(''),
    startDate: this.fb.control<Date | string | null>(null),
    endDate: this.fb.control<Date | string | null>(null),
    state: this.fb.control(''),
  });

  protected readonly filterValues = toSignal(
    this.filterForm.valueChanges.pipe(debounceTime(300), startWith(this.filterForm.value)),
    { initialValue: this.filterForm.value },
  );

  readonly workOrdersResource = rxResource({
    params: () => {
      const formatDate = (val: Date | string | null | undefined): string | undefined => {
        if (!val) return undefined;
        if (typeof val === 'string') return val;
        if (val instanceof Date) {
          const year = val.getFullYear();
          const month = String(val.getMonth() + 1).padStart(2, '0');
          const day = String(val.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        return undefined;
      };

      return {
        pageNumber: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        searchTerm: this.filterValues().name || null,
        startDate: formatDate(this.filterValues().startDate) || null,
        endDate: formatDate(this.filterValues().endDate) || null,
        state: this.filterValues().state !== '' ? Number(this.filterValues().state) : null,
        sortColumn: null,
        sortDirection: null,
        vehicleId: null,
        laborId: null,
        spot: null,
      };
    },
    stream: ({ params }) => this.workOrderService.getWorkOrders(params),
  });

  protected readonly isLoading = this.workOrdersResource.isLoading;
  protected readonly error = this.workOrdersResource.error;

  protected readonly dataSource = computed(() => {
    return this.workOrdersResource.value()?.items || [];
  });

  protected readonly totalCount = computed(() => {
    return this.workOrdersResource.value()?.totalCount || 0;
  });

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected getStatusLabel(state: workOrderState): string {
    switch (state) {
      case workOrderState.Scheduled:
        return 'Scheduled';
      case workOrderState.InProgress:
        return 'In Progress';
      case workOrderState.Completed:
        return 'Completed';
      case workOrderState.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  protected getStatusClass(state: workOrderState): string {
    switch (state) {
      case workOrderState.Scheduled:
        return 'status-scheduled';
      case workOrderState.InProgress:
        return 'status-inprogress';
      case workOrderState.Completed:
        return 'status-completed';
      case workOrderState.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  protected getPaymentStatusClass(status: string | undefined): string {
    switch (status) {
      case 'Paid':
        return 'payment-paid';
      case 'Unpaid':
        return 'payment-unpaid';
      default:
        return 'payment-pending';
    }
  }
}
