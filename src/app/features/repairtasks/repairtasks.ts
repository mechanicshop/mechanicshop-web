import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ConfirmDialog } from '@shared/components/confirm-dialog';
import { EmptyState } from '@shared/components/empty-state';
import { OperationFailed } from '@shared/components/operation-failed';
import { PageHeader } from '@shared/components/page-header';
import {
  repairTask,
  createRepairTaskRequest,
  updateRepairTaskRequest,
} from '@shared/models/repair-task/repair-task.model';
import { RepairTaskService } from '@shared/services/repair-task.service';
import { getApiErrorMessage } from '@shared/utils/utilities';

import { RepairTaskDialog, RepairTaskDialogData } from './repair-task-dialog';

@Component({
  selector: 'app-repair-tasks',
  standalone: true,
  imports: [
    CurrencyPipe,
    PageHeader,
    OperationFailed,
    EmptyState,
    MatProgressSpinner,
    MatButtonModule,
    MatIconButton,
    MatIcon,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
  ],
  template: `
    <div>
      <main class="container page-layout">
        <div class="header-row">
          <app-page-header>
            <h1>Repair Tasks</h1>
            <p>Manage standard mechanical repair tasks, pricing, and required parts.</p>
          </app-page-header>
          <button class="add-task-btn" (click)="openCreateModal()" mat-flat-button color="primary">
            <mat-icon>add</mat-icon>
            Add Task
          </button>
        </div>

        @if (isLoading()) {
          <div class="loading-container">
            <mat-progress-spinner mode="indeterminate" diameter="36" />
            <span class="loading-text">Loading repair tasks...</span>
          </div>
        } @else if (error()) {
          <app-operation-failed
            [title]="'Failed to load repair tasks'"
            [message]="'Could not connect to the backend server. Please verify your connection.'"
            (retry)="repairTasksResource.reload()"
          />
        } @else {
          <div class="search-sort-bar">
            <mat-form-field class="search-field" appearance="outline">
              <mat-label>Search repair tasks</mat-label>
              <input [(ngModel)]="searchTerms" matInput placeholder="Search by name or parts..." />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field class="sort-prop-field" appearance="outline">
              <mat-label>Sort By</mat-label>
              <mat-select [(ngModel)]="sortProperty">
                <mat-option value="name">Name</mat-option>
                <mat-option value="totalCost">Total Cost</mat-option>
                <mat-option value="duration">Duration</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="sort-dir-field" appearance="outline">
              <mat-label>Direction</mat-label>
              <mat-select [(ngModel)]="sortDirection">
                <mat-option value="asc">Ascending</mat-option>
                <mat-option value="desc">Descending</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (filteredTasks().length === 0) {
            <app-empty-state
              title="No repair tasks found"
              message="Try refining your search terms or click 'Add Task' to create one."
            />
          } @else {
            <div class="repair-tasks-grid">
              @for (task of filteredTasks(); track task.repairTaskId) {
                <div class="task-card">
                  <div class="card-header">
                    <h3 class="task-title">{{ task.name }}</h3>
                    <button
                      class="actions-btn"
                      [matMenuTriggerFor]="cardMenu"
                      mat-icon-button
                      aria-label="Actions"
                    >
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #cardMenu="matMenu">
                      <button (click)="openEditModal(task)" mat-menu-item>
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button (click)="onDeleteTask(task.repairTaskId)" mat-menu-item color="warn">
                        <mat-icon color="warn">delete</mat-icon>
                        <span class="text-danger">Delete</span>
                      </button>
                    </mat-menu>
                  </div>

                  <div class="card-body">
                    <div class="meta-row">
                      <mat-icon class="meta-icon">schedule</mat-icon>
                      <span class="meta-text"
                        >{{ task.estimatedDurationInMins }} mins ({{
                          (task.estimatedDurationInMins / 60).toFixed(2)
                        }}
                        hrs)</span
                      >
                    </div>

                    <div class="meta-row">
                      <mat-icon class="meta-icon">handyman</mat-icon>
                      <span class="meta-text">Labor: {{ task.laborCost | currency }}</span>
                    </div>

                    <div class="parts-container">
                      <span class="parts-label">Parts:</span>
                      <div class="parts-list">
                        @for (p of task.parts; track p.partId) {
                          <span class="part-badge"> {{ p.name }} (x{{ p.quantity }}) </span>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="card-footer">
                    <span class="price-label">Total Price</span>
                    <span class="price-value">{{ task.totalCost | currency }}</span>
                  </div>
                </div>
              }
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: `
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;

      & app-page-header {
        margin-bottom: 0;
      }
    }
    .add-task-btn {
      font-weight: 600;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding-block: 5rem;
      color: var(--color-muted);
    }
    .loading-text {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .search-sort-bar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
      margin-bottom: 1.5rem;

      & mat-form-field {
        width: 50%;
      }
    }
    @media (width >= 768px) {
      .search-sort-bar {
        flex-direction: row;
        align-items: center;
      }
      .sort-prop-field {
        width: 180px;
      }
      .sort-dir-field {
        width: 150px;
      }
    }
    .repair-tasks-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (width >= 1024px) {
      .repair-tasks-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .task-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      min-height: 250px;
      box-shadow: var(--shadow-sm);
      transition:
        transform 0.2s var(--ease-spring),
        box-shadow 0.2s var(--ease-spring),
        border-color 0.2s var(--ease-spring);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
        border-color: var(--color-primary);
      }
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 0.5rem;
    }
    .task-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .actions-btn {
      margin-top: -0.25rem;
      margin-right: -0.5rem;
      color: var(--color-muted);
    }
    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .meta-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-muted);
      font-size: 0.875rem;
    }
    .meta-icon {
      font-size: 1.125rem;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .parts-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: 0.5rem;
      border-top: 1px solid var(--color-outline-variant);
      padding-top: 0.5rem;
    }
    .parts-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .parts-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .part-badge {
      font-size: 0.75rem;
      background-color: var(--color-outline-variant);
      color: var(--color-ink);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      font-weight: 500;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-outline-variant);
    }
    .price-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-muted);
      text-transform: uppercase;
    }
    .price-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--color-primary);
      letter-spacing: -0.01em;
    }
    .text-danger {
      color: var(--color-danger);
    }
  `,
})
export class RepairTasks {
  private readonly repairTaskService = inject(RepairTaskService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly searchTerms = signal('');
  protected readonly sortProperty = signal<string>('name');
  protected readonly sortDirection = signal<string>('asc');

  readonly repairTasksResource = rxResource({
    stream: () => this.repairTaskService.getRepairTasks(),
  });

  protected readonly isLoading = this.repairTasksResource.isLoading;
  protected readonly error = this.repairTasksResource.error;

  protected readonly filteredTasks = computed(() => {
    const tasks = this.repairTasksResource.value() || [];
    const search = this.searchTerms().toLowerCase().trim();
    const prop = this.sortProperty();
    const dir = this.sortDirection();

    let result = [...tasks];

    if (search) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.parts.some((p) => p.name.toLowerCase().includes(search)),
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (prop) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalCost':
          comparison = a.totalCost - b.totalCost;
          break;
        case 'duration':
          comparison = a.estimatedDurationInMins - b.estimatedDurationInMins;
          break;
      }
      return dir === 'asc' ? comparison : -comparison;
    });

    return result;
  });

  protected openCreateModal(): void {
    const dialogRef = this.dialog.open<
      RepairTaskDialog,
      RepairTaskDialogData,
      createRepairTaskRequest
    >(RepairTaskDialog, {
      width: '720px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.repairTaskService.createRepairTask(result).subscribe({
          next: () => {
            this.showSnackBar('Repair task created successfully!', false);
            this.repairTasksResource.reload();
          },
          error: (err) => {
            this.showSnackBar(
              getApiErrorMessage(err, 'Operation failed: Could not create the repair task.'),
              true,
            );
          },
        });
      }
    });
  }

  protected openEditModal(task: repairTask): void {
    const dialogRef = this.dialog.open<
      RepairTaskDialog,
      { task: repairTask },
      updateRepairTaskRequest
    >(RepairTaskDialog, {
      width: '720px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-panel',
      data: { task },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.repairTaskService.updateRepairTask(task.repairTaskId, result).subscribe({
          next: () => {
            this.showSnackBar('Repair task updated successfully!', false);
            this.repairTasksResource.reload();
          },
          error: (err) => {
            this.showSnackBar(
              getApiErrorMessage(err, 'Operation failed: Could not update the repair task.'),
              true,
            );
          },
        });
      }
    });
  }

  protected onDeleteTask(taskId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Repair Task',
        message: 'Are you sure you want to delete this repair task? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'warning',
        iconColor: 'danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.repairTaskService.removeRepairTask(taskId).subscribe({
          next: () => {
            this.showSnackBar('Repair task deleted successfully!', false);
            this.repairTasksResource.reload();
          },
          error: (err) => {
            this.showSnackBar(
              getApiErrorMessage(err, 'Operation failed: Could not delete the repair task.'),
              true,
            );
          },
        });
      }
    });
  }

  private showSnackBar(message: string, isError: boolean): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
    });
  }
}
