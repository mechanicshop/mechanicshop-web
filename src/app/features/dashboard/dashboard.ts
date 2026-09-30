import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { catchError, of } from 'rxjs';

import { OperationFailed } from '@shared/components/operation-failed';
import { todayWorkOrderStats } from '@shared/models/dashboard/dashboard.model';
import { DashboardService } from '@shared/services/dashboard.service';

export interface StatusCard {
  label: string;
  value: number;
  dotColor: string;
}

export interface MetricCard {
  label: string;
  value: number;
  icon: string;
  iconColor: string;
  isCurrency?: boolean;
  isPercent?: boolean;
  isDecimal?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  host: {},
  imports: [
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
    MatCardModule,
    MatIcon,
    MatProgressSpinner,
    OperationFailed,
  ],
  template: `
    <div class="dashboard-container">
      <main class="dashboard-main container">
        @if (loading()) {
          <div class="loading-container">
            <mat-progress-spinner mode="indeterminate" diameter="36" />
            <span class="loading-text">Loading statistics…</span>
          </div>
        } @else if (error()) {
          <app-operation-failed
            (retry)="loadStats()"
            title="Failed to load statistics"
            message="Couldn't connect to the server. Check your network and try again."
          />
        } @else if (stats(); as s) {
          <div class="stats-wrapper">
            <div class="status-grid">
              @for (card of statusCards(); track card.label) {
                <div class="status-card">
                  <div class="card-header-row">
                    <span class="status-dot" [class]="card.dotColor"></span>
                    <span class="card-label">{{ card.label }}</span>
                  </div>
                  <span class="card-value">{{ card.value }}</span>
                </div>
              }
            </div>

            <div class="financial-grid">
              @for (card of financialCards(); track card.label) {
                <mat-card class="metric-card" appearance="outlined">
                  <mat-card-content class="metric-card-content">
                    <div class="card-header-row">
                      <mat-icon class="metric-icon" [class]="card.iconColor">{{
                        card.icon
                      }}</mat-icon>
                      <span class="card-label">{{ card.label }}</span>
                    </div>
                    <span class="card-value">{{
                      card.value | currency: 'USD' : 'symbol' : '1.0-0'
                    }}</span>
                  </mat-card-content>
                </mat-card>
              }
            </div>

            <div class="metric-grid-3">
              @for (card of uniqueCards(); track card.label) {
                <mat-card class="metric-card" appearance="outlined">
                  <mat-card-content class="metric-card-content">
                    <div class="card-header-row">
                      <mat-icon class="metric-icon" [class]="card.iconColor">{{
                        card.icon
                      }}</mat-icon>
                      <span class="card-label">{{ card.label }}</span>
                    </div>
                    <span class="card-value">
                      @if (card.isPercent) {
                        {{ card.value | percent: '1.1-1' }}
                      } @else {
                        {{ card.value }}
                      }
                    </span>
                  </mat-card-content>
                </mat-card>
              }
            </div>

            <div class="metric-grid-3">
              @for (card of performanceCards(); track card.label) {
                <mat-card class="metric-card" appearance="outlined">
                  <mat-card-content class="metric-card-content">
                    <div class="card-header-row">
                      <mat-icon class="metric-icon" [class]="card.iconColor">{{
                        card.icon
                      }}</mat-icon>
                      <span class="card-label">{{ card.label }}</span>
                    </div>
                    <span class="card-value">
                      @if (card.isPercent) {
                        {{ card.value | percent: '1.1-1' }}
                      } @else if (card.isCurrency) {
                        {{ card.value | currency: 'USD' : 'symbol' : '1.0-0' }}
                      } @else {
                        {{ card.value | number: '1.1-1' }}
                      }
                    </span>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .dashboard-container {
      min-height: 100vh;
      background-color: var(--color-bg);
      color: var(--color-ink);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .dashboard-main {
      padding: 1.5rem;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding-block: 5rem;
      padding-inline: 1rem;
      color: var(--color-muted);
    }
    .loading-text {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .stats-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .status-grid {
      display: grid;
      gap: 0.75rem;
    }
    @media (min-width: 640px) {
      .status-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .status-grid {
        grid-template-columns: repeat(5, 1fr);
      }
    }
    .status-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: box-shadow 0.2s var(--ease-standard);
      border: 1px solid var(--color-outline-variant);

      &:hover {
        box-shadow: var(--shadow-sm);
      }
    }
    .card-header-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: var(--radius-full);
      flex-shrink: 0;

      &.dot-primary {
        background-color: var(--color-primary);
      }
      &.dot-info {
        background-color: var(--color-info);
      }
      &.dot-warning {
        background-color: var(--color-warning);
      }
      &.dot-success {
        background-color: var(--color-success);
      }
      &.dot-danger {
        background-color: var(--color-danger);
      }
    }
    .card-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--color-ink);
      letter-spacing: -0.025em;
      line-height: 1;
    }
    .financial-grid {
      display: grid;
      gap: 0.75rem;
    }
    @media (min-width: 640px) {
      .financial-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .financial-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .metric-grid-3 {
      display: grid;
      gap: 0.75rem;
    }
    @media (min-width: 640px) {
      .metric-grid-3 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .metric-grid-3 {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    mat-card.metric-card {
      border-radius: var(--radius-md);
      transition: box-shadow 0.2s var(--ease-standard);

      &:hover {
        box-shadow: var(--shadow-sm);
      }
    }
    mat-card-content.metric-card-content {
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .metric-icon {
      font-size: 1.125rem;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      &.icon-success {
        color: var(--color-success);
      }
      &.icon-warning {
        color: var(--color-warning);
      }
      &.icon-info {
        color: var(--color-info);
      }
      &.icon-primary {
        color: var(--color-primary);
      }
      &.icon-muted {
        color: var(--color-muted);
      }
    }
  `,
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  readonly stats = signal<todayWorkOrderStats | undefined>(undefined);
  readonly loading = signal(false);
  readonly error = signal(false);

  readonly statusCards = computed<StatusCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      { label: 'Total Orders', value: s.total, dotColor: 'dot-primary' },
      { label: 'Scheduled', value: s.scheduled, dotColor: 'dot-info' },
      { label: 'In Progress', value: s.inProgress, dotColor: 'dot-warning' },
      { label: 'Completed', value: s.completed, dotColor: 'dot-success' },
      { label: 'Cancelled', value: s.cancelled, dotColor: 'dot-danger' },
    ];
  });

  readonly financialCards = computed<MetricCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      {
        label: 'Total Revenue',
        value: s.totalRevenue,
        icon: 'attach_money',
        iconColor: 'icon-success',
        isCurrency: true,
      },
      {
        label: 'Parts Cost',
        value: s.totalPartsCost,
        icon: 'build',
        iconColor: 'icon-warning',
        isCurrency: true,
      },
      {
        label: 'Labor Cost',
        value: s.totalLaborCost,
        icon: 'handyman',
        iconColor: 'icon-info',
        isCurrency: true,
      },
      {
        label: 'Net Profit',
        value: s.netProfit,
        icon: 'account_balance_wallet',
        iconColor: 'icon-primary',
        isCurrency: true,
      },
    ];
  });

  readonly uniqueCards = computed<MetricCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      {
        label: 'Unique Vehicles',
        value: s.uniqueVehicles,
        icon: 'directions_car',
        iconColor: 'icon-info',
      },
      {
        label: 'Unique Customers',
        value: s.uniqueCustomers,
        icon: 'people',
        iconColor: 'icon-primary',
      },
      {
        label: 'Profit Margin',
        value: s.profitMargin / 100,
        icon: 'trending_up',
        iconColor: 'icon-success',
        isPercent: true,
      },
    ];
  });

  readonly performanceCards = computed<MetricCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      {
        label: 'Completion Rate',
        value: s.completionRate / 100,
        icon: 'assignment_turned_in',
        iconColor: 'icon-success',
        isPercent: true,
      },
      {
        label: 'Avg. Revenue / Order',
        value: s.averageRevenuePerOrder,
        icon: 'analytics',
        iconColor: 'icon-info',
        isCurrency: true,
      },
      {
        label: 'Orders / Vehicle',
        value: s.ordersPerVehicle,
        icon: 'speed',
        iconColor: 'icon-muted',
        isDecimal: true,
      },
    ];
  });

  constructor() {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.error.set(false);

    this.dashboardService
      .getWorkOrderStats()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.loading.set(false);
          this.error.set(true);
          return of(undefined);
        }),
      )
      .subscribe((result) => {
        this.loading.set(false);
        if (result !== undefined) {
          this.stats.set(result);
          this.error.set(false);
        }
      });
  }
}
