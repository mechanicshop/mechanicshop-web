import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { spot, relocateWorkOrderRequest } from '@shared/models/work-order/work-order.model';

export interface RelocateWorkorderDialogData {
  currentSpot?: spot;
  currentStartAtUtc?: string;
}

export type RelocateWorkOrderFormGroup = FormGroup<{
  spot: FormControl<spot | null>;
  date: FormControl<Date | null>;
  time: FormControl<string | null>;
}>;

@Component({
  selector: 'app-relocate-workorder-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIcon,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="dialog-container">
      <header class="dialog-header">
        <h2 class="dialog-title">Relocate Work Order</h2>
        <button (click)="onCancel()" mat-icon-button type="button" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="relocateForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          <mat-form-field appearance="outline">
            <mat-label>New Spot (Bay)</mat-label>
            <mat-select [formControl]="spotControl">
              @for (option of spotOptions; track option.value) {
                <mat-option [value]="option.value">{{ option.label }}</mat-option>
              }
            </mat-select>
            @if (spotControl.hasError('required') && spotControl.touched) {
              <mat-error>Spot is required</mat-error>
            }
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>New Date</mat-label>
              <input [matDatepicker]="picker" [formControl]="dateControl" matInput />
              <mat-datepicker-toggle [for]="picker" matIconSuffix></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              @if (dateControl.hasError('required') && dateControl.touched) {
                <mat-error>Date is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>New Time (HH:MM)</mat-label>
              <input [formControl]="timeControl" matInput type="time" />
              @if (timeControl.hasError('required') && timeControl.touched) {
                <mat-error>Time is required</mat-error>
              }
            </mat-form-field>
          </div>
        </div>

        <footer class="dialog-actions">
          <button (click)="onCancel()" mat-button type="button">Cancel</button>
          <button [disabled]="relocateForm.invalid" mat-flat-button color="primary" type="submit">
            Relocate
          </button>
        </footer>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 560px;
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
    .form-row {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 1rem;
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
export class RelocateWorkorderDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RelocateWorkorderDialog>);
  private readonly data = inject<RelocateWorkorderDialogData>(MAT_DIALOG_DATA, { optional: true });

  protected readonly spotOptions = [
    { value: spot.A, label: 'Spot A' },
    { value: spot.B, label: 'Spot B' },
    { value: spot.C, label: 'Spot C' },
    { value: spot.D, label: 'Spot D' },
  ];

  readonly relocateForm: RelocateWorkOrderFormGroup = this.fb.group({
    spot: this.fb.control<spot | null>(null, [Validators.required]),
    date: this.fb.control<Date | null>(new Date(), [Validators.required]),
    time: this.fb.control<string | null>(null, [Validators.required]),
  });

  protected get spotControl() {
    return this.relocateForm.controls.spot;
  }

  protected get dateControl() {
    return this.relocateForm.controls.date;
  }

  protected get timeControl() {
    return this.relocateForm.controls.time;
  }

  ngOnInit(): void {
    if (this.data) {
      if (this.data.currentSpot !== null) {
        this.relocateForm.patchValue({
          spot: this.data.currentSpot,
        });
      }
      if (this.data.currentStartAtUtc) {
        const currentDate = new Date(this.data.currentStartAtUtc);
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const mins = String(currentDate.getMinutes()).padStart(2, '0');
        this.relocateForm.patchValue({
          date: currentDate,
          time: `${hours}:${mins}`,
        });
      }
    }
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.relocateForm.valid) {
      const raw = this.relocateForm.getRawValue();
      const selectedDate = raw.date ? new Date(raw.date) : new Date();
      const [hours, minutes] = (raw.time || '08:00').split(':').map(Number);
      selectedDate.setHours(hours);
      selectedDate.setMinutes(minutes);

      const response: relocateWorkOrderRequest = {
        newSpot: raw.spot as spot,
        newStartAtUtc: selectedDate.toISOString(),
      };
      this.dialogRef.close(response);
    }
  }
}
