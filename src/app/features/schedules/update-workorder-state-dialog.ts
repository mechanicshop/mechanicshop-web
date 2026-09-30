import { Component, inject, OnInit } from '@angular/core';
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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  workOrderState,
  updateWorkOrderStateRequest,
} from '@shared/models/work-order/work-order.model';

export interface UpdateWorkorderStateDialogData {
  currentState?: workOrderState;
}

export type UpdateWorkOrderStateFormGroup = FormGroup<{
  state: FormControl<workOrderState | null>;
}>;

@Component({
  selector: 'app-update-workorder-state-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIcon,
  ],
  template: `
    <div class="dialog-container">
      <header class="dialog-header">
        <h2 class="dialog-title">Update Work Order State</h2>
        <button (click)="onCancel()" mat-icon-button type="button" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="stateForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          <mat-form-field appearance="outline">
            <mat-label>Work Order State</mat-label>
            <mat-select [formControl]="stateControl">
              @for (option of stateOptions; track option.value) {
                <mat-option [value]="option.value">{{ option.label }}</mat-option>
              }
            </mat-select>
            @if (stateControl.hasError('required') && stateControl.touched) {
              <mat-error>State is required</mat-error>
            }
          </mat-form-field>
        </div>

        <footer class="dialog-actions">
          <button (click)="onCancel()" mat-button type="button">Cancel</button>
          <button [disabled]="stateForm.invalid" mat-flat-button color="primary" type="submit">
            Update State
          </button>
        </footer>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 520px;
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
export class UpdateWorkorderStateDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UpdateWorkorderStateDialog>);
  private readonly data = inject<UpdateWorkorderStateDialogData>(MAT_DIALOG_DATA, {
    optional: true,
  });

  protected readonly stateOptions = [
    { value: workOrderState.Scheduled, label: 'Scheduled' },
    { value: workOrderState.InProgress, label: 'In Progress' },
    { value: workOrderState.Completed, label: 'Completed' },
    { value: workOrderState.Cancelled, label: 'Cancelled' },
  ];

  readonly stateForm: UpdateWorkOrderStateFormGroup = this.fb.group({
    state: this.fb.control<workOrderState | null>(null, [Validators.required]),
  });

  protected get stateControl() {
    return this.stateForm.controls.state;
  }

  ngOnInit(): void {
    if (this.data && this.data.currentState !== undefined) {
      this.stateForm.patchValue({
        state: this.data.currentState,
      });
    }
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.stateForm.valid) {
      const raw = this.stateForm.getRawValue();
      const response: updateWorkOrderStateRequest = {
        state: raw.state as workOrderState,
      };
      this.dialogRef.close(response);
    }
  }
}
