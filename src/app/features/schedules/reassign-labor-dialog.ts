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
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { OperationFailed } from '@shared/components/operation-failed';
import { assignLaborRequest } from '@shared/models/work-order/work-order.model';
import { LaborService } from '@shared/services/labor.service';

export interface ReassignLaborDialogData {
  currentLaborId?: string;
}

export type ReassignLaborFormGroup = FormGroup<{
  laborId: FormControl<string>;
}>;

@Component({
  selector: 'app-reassign-labor-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIcon,
    MatProgressSpinner,
    OperationFailed,
  ],
  template: `
    <div class="dialog-container">
      <header class="dialog-header">
        <h2 class="dialog-title">Reassign Labor / Technician</h2>
        <button (click)="onCancel()" mat-icon-button type="button" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="laborForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          @if (techniciansResource.isLoading()) {
            <div class="loading-state">
              <mat-progress-spinner mode="indeterminate" diameter="28" />
              <span>Loading technicians...</span>
            </div>
          } @else if (techniciansResource.error()) {
            <app-operation-failed
              (retry)="techniciansResource.reload()"
              title="Failed to load technicians"
            />
          } @else {
            <mat-form-field appearance="outline">
              <mat-label>Assign Technician</mat-label>
              <mat-select [formControl]="laborControl">
                <mat-option [value]="''">Unassigned</mat-option>
                @for (tech of techniciansResource.value(); track tech.laborId) {
                  <mat-option [value]="tech.laborId">
                    {{ tech.name }}
                  </mat-option>
                }
              </mat-select>
              @if (laborControl.hasError('required') && laborControl.touched) {
                <mat-error>Selecting a technician is required</mat-error>
              }
            </mat-form-field>
          }
        </div>

        <footer class="dialog-actions">
          <button (click)="onCancel()" mat-button type="button">Cancel</button>
          <button
            [disabled]="
              laborForm.invalid || techniciansResource.isLoading() || !!techniciansResource.error()
            "
            mat-flat-button
            color="primary"
            type="submit"
          >
            Assign Labor
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
    .loading-state {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      color: var(--color-muted);
      font-size: 0.875rem;
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
export class ReassignLaborDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly laborService = inject(LaborService);
  private readonly dialogRef = inject(MatDialogRef<ReassignLaborDialog>);
  private readonly data = inject<ReassignLaborDialogData>(MAT_DIALOG_DATA, { optional: true });

  readonly techniciansResource = rxResource({
    stream: () => this.laborService.getLabors(),
  });

  readonly laborForm: ReassignLaborFormGroup = this.fb.group({
    laborId: this.fb.control('', [Validators.required]),
  });

  protected get laborControl() {
    return this.laborForm.controls.laborId;
  }

  constructor() {
    effect(() => {
      const technicians = this.techniciansResource.value();
      if (technicians && this.data?.currentLaborId) {
        this.laborForm.patchValue({ laborId: this.data.currentLaborId });
      }
    });
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.laborForm.valid) {
      const raw = this.laborForm.getRawValue();
      const response: assignLaborRequest = {
        laborId: raw.laborId,
      };
      this.dialogRef.close(response);
    }
  }
}
