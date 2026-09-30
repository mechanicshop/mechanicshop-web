import { CurrencyPipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { OperationFailed } from '@shared/components/operation-failed';
import { modifyRepairTaskRequest } from '@shared/models/work-order/work-order.model';
import { RepairTaskService } from '@shared/services/repair-task.service';

export interface ModifyWorkorderTasksDialogData {
  currentRepairTaskIds?: string[];
}

export type ModifyWorkOrderTasksFormGroup = FormGroup<{
  repairTaskIds: FormControl<string[]>;
}>;

@Component({
  selector: 'app-modify-workorder-tasks-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIcon,
    MatListModule,
    MatProgressSpinner,
    CurrencyPipe,
    OperationFailed,
  ],
  template: `
    <div class="dialog-container">
      <header class="dialog-header">
        <h2 class="dialog-title">Modify Work Order Tasks</h2>
        <button (click)="onCancel()" mat-icon-button type="button" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="tasksForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          <p class="section-desc">Select the repair tasks to include in this work order:</p>

          @if (repairTasksResource.isLoading()) {
            <div class="loading-state">
              <mat-progress-spinner mode="indeterminate" diameter="28" />
              <span>Loading repair tasks...</span>
            </div>
          } @else if (repairTasksResource.error()) {
            <app-operation-failed
              (retry)="repairTasksResource.reload()"
              title="Failed to load repair tasks"
            />
          } @else {
            <div class="list-container">
              <mat-selection-list [formControl]="tasksControl">
                @for (task of repairTasksResource.value(); track task.repairTaskId) {
                  <mat-list-option [value]="task.repairTaskId">
                    <div class="task-option-content">
                      <span class="task-name">{{ task.name }}</span>
                      <span class="task-meta">
                        {{ task.estimatedDurationInMins }} mins |
                        {{ task.laborCost | currency: 'USD' : 'symbol' : '2.2-2' }} labor
                      </span>
                    </div>
                  </mat-list-option>
                }
              </mat-selection-list>
            </div>
            @if (tasksControl.hasError('required') && tasksControl.touched) {
              <p class="error-text">At least one task must be selected.</p>
            }
          }
        </div>

        <footer class="dialog-actions">
          <button (click)="onCancel()" mat-button type="button">Cancel</button>
          <button
            [disabled]="
              tasksForm.invalid || repairTasksResource.isLoading() || !!repairTasksResource.error()
            "
            mat-flat-button
            color="primary"
            type="submit"
          >
            Save Tasks
          </button>
        </footer>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 640px;
    }
    .dialog-container {
      padding: 1.5rem;
      background-color: var(--color-bg);
      display: flex;
      flex-direction: column;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .dialog-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
    }
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
      min-height: 0;
      padding-block: 0.5rem;
    }
    .section-desc {
      font-size: 0.875rem;
      color: var(--color-muted);
      margin: 0;
    }
    .list-container {
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
      max-height: 300px;
      overflow-y: auto;
    }
    .task-option-content {
      display: flex;
      flex-direction: column;
      line-height: 1.3;
      padding-block: 0.25rem;
    }
    .task-name {
      font-weight: 600;
      color: var(--color-ink);
    }
    .task-meta {
      font-size: 0.75rem;
      color: var(--color-muted);
    }
    .loading-state {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      color: var(--color-muted);
      font-size: 0.875rem;
    }
    .error-text {
      color: var(--color-danger);
      font-size: 0.75rem;
      margin: 0;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-outline-variant);
    }
  `,
})
export class ModifyWorkorderTasksDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly repairTaskService = inject(RepairTaskService);
  private readonly dialogRef = inject(MatDialogRef<ModifyWorkorderTasksDialog>);
  private readonly data = inject<ModifyWorkorderTasksDialogData>(MAT_DIALOG_DATA, {
    optional: true,
  });

  readonly repairTasksResource = rxResource({
    stream: () => this.repairTaskService.getRepairTasks(),
  });

  readonly tasksForm: ModifyWorkOrderTasksFormGroup = this.fb.group({
    repairTaskIds: this.fb.control<string[]>([], [Validators.required, Validators.minLength(1)]),
  });

  protected get tasksControl() {
    return this.tasksForm.controls.repairTaskIds;
  }

  constructor() {
    effect(() => {
      const tasks = this.repairTasksResource.value();
      if (tasks && this.data?.currentRepairTaskIds) {
        this.tasksForm.patchValue({ repairTaskIds: this.data.currentRepairTaskIds });
      }
    });
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.tasksForm.valid) {
      const response: modifyRepairTaskRequest = {
        repairTaskIds: this.tasksControl.value,
      };
      this.dialogRef.close(response);
    }
  }
}
