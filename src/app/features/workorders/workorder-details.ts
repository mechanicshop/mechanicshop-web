import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OperationFailed } from '@shared/components/operation-failed';
import { PageHeader } from '@shared/components/page-header';
import { spot, workOrderState } from '@shared/models/work-order/work-order.model';
import { WorkOrderService } from '@shared/services/work-order.service';

@Component({
  selector: 'app-work-order-details',
  standalone: true,
  imports: [
    PageHeader,
    OperationFailed,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterLink,
    DatePipe,
    CurrencyPipe,
  ],
  template: `
    <div>
      <main class="container page-layout">
        <div class="header-navigation">
          <button class="back-btn" routerLink="/workorders" mat-stroked-button>
            <mat-icon>arrow_back</mat-icon>
            Back to Work Orders
          </button>
        </div>

        @if (isLoading()) {
          <div class="loading-container">
            <mat-progress-spinner mode="indeterminate" diameter="48" />
            <span class="loading-text">Loading work order details...</span>
          </div>
        } @else if (error() || !workOrder()) {
          <app-operation-failed
            [title]="'Failed to load work order'"
            [message]="'An error occurred while loading this work order. It might have been deleted or the server is unavailable.'"
            (retry)="workOrderResource.reload()"
          />
        } @else {
          @let wo = workOrder()!;
          <app-page-header>
            <h1>Work Order Details</h1>
            <p>ID: {{ wo.workOrderId }}</p>
          </app-page-header>

          <div class="details-grid">
            <div class="details-panel-left">
              <mat-card class="detail-card">
                <mat-card-header>
                  <mat-icon class="card-icon" mat-card-avatar>info</mat-icon>
                  <mat-card-title>Status & Timing</mat-card-title>
                </mat-card-header>
                <mat-card-content class="card-body">
                  <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="status-badge" [class]="getStatusClass(wo.state)">
                      {{ getStatusLabel(wo.state) }}
                    </span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Service Spot</span>
                    <span class="spot-badge">Spot {{ getSpotLabel(wo.spot) }}</span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Scheduled Start</span>
                    <span class="detail-value">{{ wo.startAtUtc | date: 'MMM d, y, h:mm a' }}</span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Scheduled End</span>
                    <span class="detail-value">{{ wo.endAtUtc | date: 'MMM d, y, h:mm a' }}</span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Total Duration</span>
                    <span class="detail-value">{{ wo.totalDurationInMins }} mins</span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Created At</span>
                    <span class="detail-value">{{ wo.createdAt | date: 'MMM d, y, h:mm a' }}</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="detail-card">
                <mat-card-header>
                  <mat-icon class="card-icon" mat-card-avatar>directions_car</mat-icon>
                  <mat-card-title>Vehicle Information</mat-card-title>
                </mat-card-header>
                <mat-card-content class="card-body">
                  @if (wo.vehicle) {
                    <div class="detail-row">
                      <span class="detail-label">Make & Model</span>
                      <span class="detail-value font-highlight">
                        {{ wo.vehicle.make }} {{ wo.vehicle.model }}
                      </span>
                    </div>

                    <div class="detail-row">
                      <span class="detail-label">Year</span>
                      <span class="detail-value">{{ wo.vehicle.year }}</span>
                    </div>

                    <div class="detail-row">
                      <span class="detail-label">License Plate</span>
                      <span class="plate-badge">{{ wo.vehicle.licensePlate }}</span>
                    </div>
                  } @else {
                    <p class="empty-message">No vehicle information associated.</p>
                  }
                </mat-card-content>
              </mat-card>

              <mat-card class="detail-card">
                <mat-card-header>
                  <mat-icon class="card-icon" mat-card-avatar>engineering</mat-icon>
                  <mat-card-title>Assigned Labor</mat-card-title>
                </mat-card-header>
                <mat-card-content class="card-body">
                  @if (wo.labor) {
                    <div class="detail-row">
                      <span class="detail-label">Mechanic Name</span>
                      <span class="detail-value font-highlight">{{ wo.labor.name }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Labor ID</span>
                      <span class="detail-value uuid-text">{{ wo.labor.laborId }}</span>
                    </div>
                  } @else {
                    <div class="unassigned-row">
                      <mat-icon class="warn-icon">warning_amber</mat-icon>
                      <span class="empty-message">No mechanic assigned yet.</span>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>

            <div class="details-panel-right">
              <mat-card class="detail-card">
                <mat-card-header>
                  <mat-icon class="card-icon" mat-card-avatar>build</mat-icon>
                  <mat-card-title>Repair Tasks ({{ wo.repairTasks.length }})</mat-card-title>
                </mat-card-header>
                <mat-card-content class="card-body">
                  @if (wo.repairTasks && wo.repairTasks.length > 0) {
                    <div class="tasks-list">
                      @for (task of wo.repairTasks; track task.repairTaskId; let last = $last) {
                        <div class="task-item" [class.no-border]="last">
                          <div class="task-header-row">
                            <span class="task-name">{{ task.name }}</span>
                            <span class="task-cost">{{ task.totalCost | currency }}</span>
                          </div>
                          <div class="task-meta">
                            <span
                              ><mat-icon>schedule</mat-icon>
                              {{ task.estimatedDurationInMins }} mins</span
                            >
                            <span
                              ><mat-icon>handyman</mat-icon> Labor:
                              {{ task.laborCost | currency }}</span
                            >
                          </div>

                          @if (task.parts && task.parts.length > 0) {
                            <div class="task-parts">
                              <span class="parts-title">Parts Used:</span>
                              <div class="parts-chips">
                                @for (p of task.parts; track p.partId) {
                                  <span class="part-chip">
                                    {{ p.name }} (x{{ p.quantity }}) - {{ p.cost | currency }}
                                  </span>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="empty-message">No repair tasks added to this work order.</p>
                  }
                </mat-card-content>
              </mat-card>

              <mat-card class="detail-card summary-card">
                <mat-card-header>
                  <mat-icon class="card-icon" mat-card-avatar>receipt_long</mat-icon>
                  <mat-card-title>Cost & Invoice Summary</mat-card-title>
                </mat-card-header>
                <mat-card-content class="card-body">
                  <div class="summary-row">
                    <span>Labor Subtotal</span>
                    <span>{{ wo.totalLaborCost | currency }}</span>
                  </div>

                  <div class="summary-row">
                    <span>Parts Subtotal</span>
                    <span>{{ wo.totalPartCost | currency }}</span>
                  </div>

                  @if (wo.discount) {
                    <div class="summary-row discount-row">
                      <span>Discount</span>
                      <span>-{{ wo.discount | currency }}</span>
                    </div>
                  }

                  @if (wo.tax) {
                    <div class="summary-row">
                      <span>Tax</span>
                      <span>{{ wo.tax | currency }}</span>
                    </div>
                  }

                  <div class="divider"></div>

                  <div class="summary-row total-row">
                    <span>Grand Total</span>
                    <span class="total-value">{{ wo.totalCost | currency }}</span>
                  </div>

                  @if (wo.invoiceId) {
                    <div class="invoice-box">
                      <mat-icon class="invoice-icon">receipt</mat-icon>
                      <div class="invoice-info">
                        <span class="invoice-label">Invoiced</span>
                        <span class="invoice-id">{{ wo.invoiceId }}</span>
                      </div>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: `
    .page-layout {
      padding-block: 2rem;
    }

    .header-navigation {
      margin-bottom: 1.5rem;
    }

    .back-btn {
      border-radius: var(--radius-md);
      font-weight: 500;
      color: var(--color-ink);

      &:hover {
        background-color: var(--color-outline-variant);
      }
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

    .details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    @media (width >= 1024px) {
      .details-grid {
        grid-template-columns: 1fr 1.2fr;
      }
    }

    .details-panel-left,
    .details-panel-right {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .detail-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 0.5rem;

      & mat-card-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-ink);
      }
    }

    .card-icon {
      color: var(--color-primary);
      margin-right: 0.5rem;
    }

    .card-body {
      padding-top: 1.25rem !important;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-outline-variant);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .detail-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-muted);
    }

    .detail-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .font-highlight {
      font-size: 0.95rem;
      color: var(--color-primary);
    }

    .uuid-text {
      font-family: monospace;
      font-size: 0.75rem;
      color: var(--color-muted);
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
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

    .spot-badge {
      background-color: var(--color-outline-variant);
      color: var(--color-ink);
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
    }

    .plate-badge {
      background-color: #333;
      color: #fff;
      font-family: monospace;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      border: 1px solid var(--color-outline);
    }

    .unassigned-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-warning);
    }

    .warn-icon {
      font-size: 1.25rem;
      width: 20px;
      height: 20px;
    }

    .empty-message {
      font-size: 0.875rem;
      color: var(--color-muted);
      margin: 0;
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .task-item {
      border-bottom: 1px dashed var(--color-outline-variant);
      padding-bottom: 1rem;

      &:last-child,
      .no-border {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .task-header-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.25rem;
    }

    .task-name {
      font-weight: 600;
      color: var(--color-ink);
      font-size: 0.95rem;
    }

    .task-cost {
      font-weight: 700;
      color: var(--color-primary);
    }

    .task-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: var(--color-muted);
      margin-bottom: 0.5rem;

      span {
        display: flex;
        align-items: center;
        gap: 0.25rem;

        mat-icon {
          font-size: 0.9rem;
          width: 14px;
          height: 14px;
        }
      }
    }

    .task-parts {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: 0.25rem;
    }

    .parts-title {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--color-muted);
      text-transform: uppercase;
    }

    .parts-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .part-chip {
      font-size: 0.725rem;
      padding: 0.15rem 0.5rem;
      background-color: var(--color-outline-variant);
      color: var(--color-ink);
      border-radius: var(--radius-full);
      border: 1px solid rgba(140, 140, 140, 0.08);
    }

    .summary-card {
      border-color: var(--color-primary);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--color-ink);
      padding-block: 0.25rem;
    }

    .discount-row {
      color: var(--color-danger);
    }

    .divider {
      height: 1px;
      background-color: var(--color-outline-variant);
      margin-block: 0.5rem;
    }

    .total-row {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--color-ink);
      align-items: baseline;
    }

    .total-value {
      font-size: 1.4rem;
      color: var(--color-primary);
      letter-spacing: -0.01em;
    }

    .invoice-box {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: var(--color-primary-container);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border: 1px solid rgba(230, 92, 0, 0.15);
    }

    .invoice-icon {
      color: var(--color-on-primary-container);
    }

    .invoice-info {
      display: flex;
      flex-direction: column;
    }

    .invoice-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--color-on-primary-container);
      text-transform: uppercase;
    }

    .invoice-id {
      font-family: monospace;
      font-size: 0.775rem;
      color: var(--color-on-primary-container);
      font-weight: 600;
    }
  `,
})
export class WorkOrderDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly workOrderService = inject(WorkOrderService);

  protected readonly workOrderId = computed(() => {
    return this.route.snapshot.paramMap.get('id') || '';
  });

  readonly workOrderResource = rxResource({
    params: () => ({ id: this.workOrderId() }),
    stream: ({ params }) => this.workOrderService.getWorkOrderById(params.id),
  });

  protected readonly isLoading = this.workOrderResource.isLoading;
  protected readonly error = this.workOrderResource.error;
  protected readonly workOrder = this.workOrderResource.value;

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

  protected getSpotLabel(s: spot): string {
    switch (s) {
      case spot.A:
        return 'A';
      case spot.B:
        return 'B';
      case spot.C:
        return 'C';
      case spot.D:
        return 'D';
      default:
        return '';
    }
  }
}
