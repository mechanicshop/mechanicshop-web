import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { repairDurationInMinutes, repairTask } from '@shared/models/repair-task/repair-task.model';

export interface RepairTaskDialogData {
  task?: repairTask;
}

export type PartFormGroup = FormGroup<{
  partId: FormControl<string>;
  name: FormControl<string>;
  cost: FormControl<number>;
  quantity: FormControl<number>;
}>;

export type RepairTaskFormGroup = FormGroup<{
  name: FormControl<string>;
  estimatedDurationInMins: FormControl<repairDurationInMinutes>;
  laborCost: FormControl<number>;
  parts: FormArray<PartFormGroup>;
}>;

@Component({
  selector: 'app-repair-task-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconButton,
    MatIcon,
  ],
  template: `
    <div class="dialog-container">
      <header class="dialog-header">
        <h2 class="dialog-title">{{ isEditMode ? 'Edit' : 'Create' }} Repair Task</h2>
        <button (click)="onCancel()" mat-icon-button aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="repairTaskForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          <mat-form-field appearance="outline">
            <mat-label>Task Name</mat-label>
            <input
              [formControl]="nameControl"
              matInput
              placeholder="e.g., Oil Change, Brake Pad Replacement"
            />
            @if (nameControl.hasError('required') && nameControl.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Estimated Duration</mat-label>
              <mat-select [formControl]="durationControl">
                @for (dur of durations; track dur) {
                  <mat-option [value]="dur"
                    >{{ dur }} mins ({{ (dur / 60).toFixed(2) }} hrs)</mat-option
                  >
                }
              </mat-select>
              @if (durationControl.hasError('required') && durationControl.touched) {
                <mat-error>Duration is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Labor Cost ($)</mat-label>
              <input [formControl]="laborCostControl" matInput type="number" min="0" step="0.01" />
              @if (laborCostControl.hasError('required') && laborCostControl.touched) {
                <mat-error>Labor cost is required</mat-error>
              }
              @if (laborCostControl.hasError('min') && laborCostControl.touched) {
                <mat-error>Labor cost must be at least 0</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="parts-section">
            <div class="parts-header">
              <h3 class="parts-title">Parts / Materials</h3>
              <button (click)="addPart()" mat-stroked-button type="button">
                <mat-icon>add</mat-icon>
                Add Part
              </button>
            </div>

            @if (partsArray.length === 0) {
              <p class="empty-parts-text text-danger">
                At least one part must be associated with the task.
              </p>
            } @else {
              <div class="parts-list">
                @for (partForm of partsArray.controls; track partForm; let idx = $index) {
                  <div class="part-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Part Name</mat-label>
                      <input
                        [formControl]="partForm.controls.name"
                        matInput
                        placeholder="Part name"
                      />
                      @if (
                        partForm.controls.name.hasError('required') &&
                        partForm.controls.name.touched
                      ) {
                        <mat-error>Required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Cost ($)</mat-label>
                      <input
                        [formControl]="partForm.controls.cost"
                        matInput
                        type="number"
                        min="0"
                        step="0.01"
                      />
                      @if (
                        partForm.controls.cost.hasError('required') &&
                        partForm.controls.cost.touched
                      ) {
                        <mat-error>Required</mat-error>
                      }
                      @if (
                        partForm.controls.cost.hasError('min') && partForm.controls.cost.touched
                      ) {
                        <mat-error>Min 0</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Qty</mat-label>
                      <input
                        [formControl]="partForm.controls.quantity"
                        matInput
                        type="number"
                        min="1"
                      />
                      @if (
                        partForm.controls.quantity.hasError('required') &&
                        partForm.controls.quantity.touched
                      ) {
                        <mat-error>Required</mat-error>
                      }
                      @if (
                        partForm.controls.quantity.hasError('min') &&
                        partForm.controls.quantity.touched
                      ) {
                        <mat-error>Min 1</mat-error>
                      }
                    </mat-form-field>

                    <button
                      (click)="removePart(idx)"
                      mat-icon-button
                      type="button"
                      color="warn"
                      aria-label="Remove part"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <footer class="dialog-actions">
          <button (click)="onCancel()" mat-button type="button">Cancel</button>
          <button [disabled]="repairTaskForm.invalid" mat-flat-button color="primary" type="submit">
            {{ isEditMode ? 'Save Changes' : 'Create Task' }}
          </button>
        </footer>
      </form>
    </div>
  `,
  styles: `
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
      padding-inline: 0.25rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (width >= 600px) {
      .form-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .parts-section {
      border-top: 1px solid var(--color-outline-variant);
      padding-top: 1.25rem;
      margin-top: 0.5rem;
    }
    .parts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .parts-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-ink);
      margin: 0;
    }
    .empty-parts-text {
      font-size: 0.875rem;
      color: var(--color-muted);
      font-style: italic;
      margin-block: 1rem;
    }
    .empty-parts-text.text-danger {
      color: var(--color-danger);
    }
    .part-row {
      display: grid;
      grid-template-columns: 1.8fr 1fr 0.8fr auto;
      gap: 0.75rem;
      align-items: start;
      margin-bottom: 0.5rem;
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
export class RepairTaskDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RepairTaskDialog>);
  private readonly data = inject<RepairTaskDialogData>(MAT_DIALOG_DATA, { optional: true });

  protected readonly durations = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];
  protected isEditMode = false;

  readonly repairTaskForm: RepairTaskFormGroup = this.fb.group<RepairTaskFormGroup['controls']>({
    name: this.fb.control('', [Validators.required]),
    estimatedDurationInMins: this.fb.control(repairDurationInMinutes.Min30, [Validators.required]),
    laborCost: this.fb.control(0, [Validators.required, Validators.min(0)]),
    parts: this.fb.array<PartFormGroup>([], [Validators.minLength(1)]),
  });

  protected get nameControl() {
    return this.repairTaskForm.controls.name;
  }

  protected get durationControl() {
    return this.repairTaskForm.controls.estimatedDurationInMins;
  }

  protected get laborCostControl() {
    return this.repairTaskForm.controls.laborCost;
  }

  protected get partsArray() {
    return this.repairTaskForm.controls.parts;
  }

  ngOnInit(): void {
    if (this.data?.task) {
      this.isEditMode = true;
      const t = this.data.task;

      this.repairTaskForm.patchValue({
        name: t.name,
        estimatedDurationInMins: t.estimatedDurationInMins,
        laborCost: t.laborCost,
      });

      if (t.parts && t.parts.length > 0) {
        t.parts.forEach((p) => {
          this.partsArray.push(
            this.fb.group<PartFormGroup['controls']>({
              partId: this.fb.control(p.partId),
              name: this.fb.control(p.name, [Validators.required]),
              cost: this.fb.control(p.cost, [Validators.required, Validators.min(0)]),
              quantity: this.fb.control(p.quantity, [Validators.required, Validators.min(1)]),
            }),
          );
        });
      }
    } else {
      this.addPart();
    }
  }

  protected addPart(): void {
    this.partsArray.push(
      this.fb.group<PartFormGroup['controls']>({
        partId: this.fb.control(''),
        name: this.fb.control('', [Validators.required]),
        cost: this.fb.control(0, [Validators.required, Validators.min(0)]),
        quantity: this.fb.control(1, [Validators.required, Validators.min(1)]),
      }),
    );
  }

  protected removePart(index: number): void {
    this.partsArray.removeAt(index);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.repairTaskForm.valid) {
      this.dialogRef.close(this.repairTaskForm.getRawValue());
    }
  }
}
