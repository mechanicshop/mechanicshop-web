import { Component, OnInit, inject } from '@angular/core';
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

import { customer } from '@shared/models/customer/customer.model';

export interface CustomerDialogData {
  customer?: customer;
}

export type VehicleFormGroup = FormGroup<{
  vehicleId: FormControl<string>;
  make: FormControl<string>;
  model: FormControl<string>;
  year: FormControl<number>;
  licensePlate: FormControl<string>;
}>;

export type CustomerFormGroup = FormGroup<{
  name: FormControl<string>;
  phoneNumber: FormControl<string>;
  email: FormControl<string>;
  vehicles: FormArray<VehicleFormGroup>;
}>;

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconButton,
    MatIcon,
  ],
  template: `
    <div class="dialog-container">
      <header class="dialog-header">
        <h2 class="dialog-title">{{ isEditMode ? 'Edit' : 'Create' }} Customer</h2>
        <button (click)="onCancel()" mat-icon-button aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          <mat-form-field appearance="outline">
            <mat-label>Customer Name</mat-label>
            <input [formControl]="nameControl" matInput placeholder="e.g., John Doe" />
            @if (nameControl.hasError('required') && nameControl.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input [formControl]="phoneControl" matInput placeholder="e.g., 555-0199" />
              @if (phoneControl.hasError('required') && phoneControl.touched) {
                <mat-error>Phone is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email Address</mat-label>
              <input
                [formControl]="emailControl"
                matInput
                type="email"
                placeholder="e.g., john.doe@example.com"
              />
              @if (emailControl.hasError('required') && emailControl.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (emailControl.hasError('email') && emailControl.touched) {
                <mat-error>Invalid email format</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="vehicles-section">
            <div class="vehicles-header">
              <h3 class="vehicles-title">Vehicles</h3>
              <button (click)="addVehicle()" mat-stroked-button type="button">
                <mat-icon>add</mat-icon>
                Add Vehicle
              </button>
            </div>

            @if (vehiclesArray.length === 0) {
              <p class="empty-vehicles-text text-danger">
                At least one vehicle must be associated with the customer.
              </p>
            } @else {
              <div class="vehicles-list">
                @for (vehicleForm of vehiclesArray.controls; track vehicleForm; let idx = $index) {
                  <div class="vehicle-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Make</mat-label>
                      <input
                        [formControl]="vehicleForm.controls.make"
                        matInput
                        placeholder="e.g., Toyota"
                      />
                      @if (
                        vehicleForm.controls.make.hasError('required') &&
                        vehicleForm.controls.make.touched
                      ) {
                        <mat-error>Required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Model</mat-label>
                      <input
                        [formControl]="vehicleForm.controls.model"
                        matInput
                        placeholder="e.g., Camry"
                      />
                      @if (
                        vehicleForm.controls.model.hasError('required') &&
                        vehicleForm.controls.model.touched
                      ) {
                        <mat-error>Required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Year</mat-label>
                      <input
                        [formControl]="vehicleForm.controls.year"
                        matInput
                        type="number"
                        min="1900"
                        max="2100"
                      />
                      @if (
                        vehicleForm.controls.year.hasError('required') &&
                        vehicleForm.controls.year.touched
                      ) {
                        <mat-error>Required</mat-error>
                      }
                      @if (
                        (vehicleForm.controls.year.hasError('min') ||
                          vehicleForm.controls.year.hasError('max')) &&
                        vehicleForm.controls.year.touched
                      ) {
                        <mat-error>1900-2100</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Plate</mat-label>
                      <input
                        [formControl]="vehicleForm.controls.licensePlate"
                        matInput
                        placeholder="e.g., ABC-123"
                      />
                      @if (
                        vehicleForm.controls.licensePlate.hasError('required') &&
                        vehicleForm.controls.licensePlate.touched
                      ) {
                        <mat-error>Required</mat-error>
                      }
                    </mat-form-field>

                    <button
                      (click)="removeVehicle(idx)"
                      mat-icon-button
                      color="warn"
                      type="button"
                      aria-label="Remove vehicle"
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
          <button [disabled]="customerForm.invalid" mat-flat-button color="primary" type="submit">
            {{ isEditMode ? 'Save Changes' : 'Create Customer' }}
          </button>
        </footer>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 780px;
    }
    .dialog-container {
      display: flex;
      flex-direction: column;
      max-height: 85vh;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--color-outline-variant);
    }
    .dialog-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
    }
    .dialog-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (width >= 600px) {
      .form-row {
        grid-template-columns: 1fr 1fr;
      }
    }
    .vehicles-section {
      margin-top: 0.5rem;
    }
    .vehicles-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .vehicles-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-ink);
      margin: 0;
    }
    .empty-vehicles-text {
      font-size: 0.875rem;
      color: var(--color-muted);
      font-style: italic;
      margin-block: 1rem;
    }
    .empty-vehicles-text.text-danger {
      color: var(--color-danger);
    }
    .vehicle-row {
      display: grid;
      grid-template-columns: 1.2fr 1.2fr 0.8fr 1fr auto;
      gap: 0.75rem;
      align-items: start;
      margin-bottom: 0.5rem;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--color-outline-variant);
    }
    .text-danger {
      color: var(--color-danger);
    }
  `,
})
export class CustomerDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CustomerDialog>);
  private readonly data = inject<CustomerDialogData>(MAT_DIALOG_DATA, { optional: true });

  protected isEditMode = false;

  readonly customerForm: CustomerFormGroup = this.fb.group<CustomerFormGroup['controls']>({
    name: this.fb.control('', [Validators.required]),
    phoneNumber: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    vehicles: this.fb.array<VehicleFormGroup>([], [Validators.minLength(1)]),
  });

  protected get nameControl() {
    return this.customerForm.controls.name;
  }

  protected get phoneControl() {
    return this.customerForm.controls.phoneNumber;
  }

  protected get emailControl() {
    return this.customerForm.controls.email;
  }

  protected get vehiclesArray() {
    return this.customerForm.controls.vehicles;
  }

  ngOnInit(): void {
    if (this.data?.customer) {
      this.isEditMode = true;
      const c = this.data.customer;

      this.customerForm.patchValue({
        name: c.name,
        phoneNumber: c.phoneNumber,
        email: c.email,
      });

      if (c.vehicles && c.vehicles.length > 0) {
        c.vehicles.forEach((v) => {
          this.vehiclesArray.push(
            this.fb.group<VehicleFormGroup['controls']>({
              vehicleId: this.fb.control(v.vehicleId),
              make: this.fb.control(v.make, [Validators.required]),
              model: this.fb.control(v.model, [Validators.required]),
              year: this.fb.control(v.year, [
                Validators.required,
                Validators.min(1900),
                Validators.max(2100),
              ]),
              licensePlate: this.fb.control(v.licensePlate, [Validators.required]),
            }),
          );
        });
      }
    } else {
      this.addVehicle();
    }
  }

  protected addVehicle(): void {
    this.vehiclesArray.push(
      this.fb.group<VehicleFormGroup['controls']>({
        vehicleId: this.fb.control(''),
        make: this.fb.control('', [Validators.required]),
        model: this.fb.control('', [Validators.required]),
        year: this.fb.control(new Date().getFullYear(), [
          Validators.required,
          Validators.min(1900),
          Validators.max(2100),
        ]),
        licensePlate: this.fb.control('', [Validators.required]),
      }),
    );
  }

  protected removeVehicle(index: number): void {
    this.vehiclesArray.removeAt(index);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.customerForm.valid) {
      this.dialogRef.close(this.customerForm.getRawValue());
    }
  }
}
