import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
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
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { forkJoin } from 'rxjs';

import { customer, vehicle } from '@shared/models/customer/customer.model';
import { labor } from '@shared/models/labor/labor.model';
import { repairTask } from '@shared/models/repair-task/repair-task.model';
import { spot, createWorkOrderRequest } from '@shared/models/work-order/work-order.model';
import { CustomerService } from '@shared/services/customer.service';
import { LaborService } from '@shared/services/labor.service';
import { RepairTaskService } from '@shared/services/repair-task.service';

export interface NewWorkOrderDialogData {
  defaultDate?: Date;
  defaultSpot?: spot;
}

export type NewWorkOrderFormGroup = FormGroup<{
  customerId: FormControl<string>;
  vehicleId: FormControl<string>;
  spot: FormControl<spot | null>;
  laborId: FormControl<string>;
  date: FormControl<Date | null>;
  time: FormControl<string>;
  repairTaskIds: FormControl<string[]>;
}>;

@Component({
  selector: 'app-new-workorder-dialog',
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
    MatProgressSpinner,
    CurrencyPipe,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="dialog-container">
      <header class="dialog-header">
        <h2 class="dialog-title">New Work Order</h2>
        <button (click)="onCancel()" mat-icon-button type="button" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      @if (isLoading()) {
        <div class="loading-state">
          <mat-progress-spinner mode="indeterminate" diameter="36" />
          <span>Loading required data...</span>
        </div>
      } @else {
        <form [formGroup]="workOrderForm" (ngSubmit)="onSubmit()">
          <div class="dialog-content">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Customer</mat-label>
                <mat-select [formControl]="customerControl" (selectionChange)="onCustomerChange()">
                  @for (cust of customers(); track cust.customerId) {
                    <mat-option [value]="cust.customerId">{{ cust.name }}</mat-option>
                  }
                </mat-select>
                @if (customerControl.hasError('required') && customerControl.touched) {
                  <mat-error>Customer is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Vehicle</mat-label>
                <mat-select [formControl]="vehicleControl" [disabled]="!customerControl.value">
                  @for (veh of availableVehicles(); track veh.vehicleId) {
                    <mat-option [value]="veh.vehicleId">
                      {{ veh.make }} {{ veh.model }} ({{ veh.year }})
                    </mat-option>
                  }
                </mat-select>
                @if (vehicleControl.hasError('required') && vehicleControl.touched) {
                  <mat-error>Vehicle is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Spot (Bay)</mat-label>
                <mat-select [formControl]="spotControl">
                  @for (opt of spotOptions; track opt.value) {
                    <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                  }
                </mat-select>
                @if (spotControl.hasError('required') && spotControl.touched) {
                  <mat-error>Spot is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Technician (Labor)</mat-label>
                <mat-select [formControl]="laborControl">
                  @for (tech of technicians(); track tech.laborId) {
                    <mat-option [value]="tech.laborId">
                      {{ tech.name }}
                    </mat-option>
                  }
                </mat-select>
                @if (laborControl.hasError('required') && laborControl.touched) {
                  <mat-error>Technician is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Scheduled Date</mat-label>
                <input [matDatepicker]="picker" [formControl]="dateControl" matInput />
                <mat-datepicker-toggle [for]="picker" matIconSuffix></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                @if (dateControl.hasError('required') && dateControl.touched) {
                  <mat-error>Date is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Scheduled Time</mat-label>
                <input [formControl]="timeControl" matInput type="time" />
                @if (timeControl.hasError('required') && timeControl.touched) {
                  <mat-error>Time is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="tasks-section">
              <h3 class="section-title">Select Repair Tasks</h3>
              <mat-form-field class="full-width" appearance="outline">
                <mat-label>Repair Tasks</mat-label>
                <mat-select [formControl]="tasksControl" multiple>
                  @for (task of repairTasks(); track task.repairTaskId) {
                    <mat-option [value]="task.repairTaskId">
                      {{ task.name }} ({{ task.laborCost | currency: 'USD' : 'symbol' : '2.2-2' }})
                    </mat-option>
                  }
                </mat-select>
                @if (tasksControl.hasError('required') && tasksControl.touched) {
                  <mat-error>At least one task is required</mat-error>
                }
              </mat-form-field>
            </div>
          </div>

          <footer class="dialog-actions">
            <button (click)="onCancel()" mat-button type="button">Cancel</button>
            <button
              [disabled]="workOrderForm.invalid"
              mat-flat-button
              color="primary"
              type="submit"
            >
              Create Work Order
            </button>
          </footer>
        </form>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 720px;
    }
    .dialog-container {
      padding: 1.5rem;
      background-color: var(--color-bg);
      display: flex;
      flex-direction: column;
      max-height: 85vh;
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
      overflow-y: auto;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (width >= 500px) {
      .form-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .tasks-section {
      border-top: 1px solid var(--color-outline-variant);
      padding-top: 1.25rem;
      margin-top: 0.5rem;
    }
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-ink);
      margin-bottom: 0.75rem;
    }
    .full-width {
      width: 100%;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 3rem;
      color: var(--color-muted);
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
export class NewWorkOrderDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly laborService = inject(LaborService);
  private readonly repairTaskService = inject(RepairTaskService);
  private readonly dialogRef = inject(MatDialogRef<NewWorkOrderDialog>);
  private readonly data = inject<NewWorkOrderDialogData>(MAT_DIALOG_DATA, { optional: true });

  protected readonly customers = signal<customer[]>([]);
  protected readonly technicians = signal<labor[]>([]);
  protected readonly repairTasks = signal<repairTask[]>([]);
  protected readonly isLoading = signal(true);

  protected readonly availableVehicles = signal<vehicle[]>([]);

  protected readonly spotOptions = [
    { value: spot.A, label: 'Spot A' },
    { value: spot.B, label: 'Spot B' },
    { value: spot.C, label: 'Spot C' },
    { value: spot.D, label: 'Spot D' },
  ];

  readonly workOrderForm: NewWorkOrderFormGroup = this.fb.group({
    customerId: this.fb.control('', [Validators.required]),
    vehicleId: this.fb.control('', [Validators.required]),
    spot: this.fb.control<spot | null>(null, [Validators.required]),
    laborId: this.fb.control('', [Validators.required]),
    date: this.fb.control<Date | null>(new Date(), [Validators.required]),
    time: this.fb.control<string>('08:00', [Validators.required]),
    repairTaskIds: this.fb.control<string[]>([], [Validators.required, Validators.minLength(1)]),
  });

  protected get customerControl() {
    return this.workOrderForm.controls.customerId;
  }

  protected get vehicleControl() {
    return this.workOrderForm.controls.vehicleId;
  }

  protected get spotControl() {
    return this.workOrderForm.controls.spot;
  }

  protected get laborControl() {
    return this.workOrderForm.controls.laborId;
  }

  protected get dateControl() {
    return this.workOrderForm.controls.date;
  }

  protected get timeControl() {
    return this.workOrderForm.controls.time;
  }

  protected get tasksControl() {
    return this.workOrderForm.controls.repairTaskIds;
  }

  ngOnInit(): void {
    forkJoin({
      customers: this.customerService.getCustomers(),
      labors: this.laborService.getLabors(),
      repairTasks: this.repairTaskService.getRepairTasks(),
    }).subscribe({
      next: (res) => {
        this.customers.set(res.customers);
        this.technicians.set(res.labors);
        this.repairTasks.set(res.repairTasks);
        this.isLoading.set(false);

        // Prepopulate defaults if provided
        if (this.data) {
          if (this.data.defaultDate) {
            const date = this.data.defaultDate;
            const hours = String(date.getHours()).padStart(2, '0');
            const mins = String(date.getMinutes()).padStart(2, '0');
            this.workOrderForm.patchValue({
              date: date,
              time: `${hours}:${mins}`,
            });
          }
          if (this.data.defaultSpot !== undefined) {
            this.workOrderForm.patchValue({
              spot: this.data.defaultSpot,
            });
          }
        }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  protected onCustomerChange(): void {
    const selectedCustId = this.customerControl.value;
    const selectedCustomer = this.customers().find((c) => c.customerId === selectedCustId);
    this.availableVehicles.set(selectedCustomer?.vehicles || []);
    this.vehicleControl.enable();
    this.vehicleControl.setValue('');
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.workOrderForm.valid) {
      const raw = this.workOrderForm.getRawValue();
      const selectedDate = raw.date ? new Date(raw.date) : new Date();
      const [hours, minutes] = (raw.time || '08:00').split(':').map(Number);
      selectedDate.setHours(hours);
      selectedDate.setMinutes(minutes);

      const response: createWorkOrderRequest = {
        spot: raw.spot as spot,
        vehicleId: raw.vehicleId,
        laborId: raw.laborId,
        repairTaskIds: raw.repairTaskIds,
        startAtUtc: selectedDate.toISOString(),
      };
      this.dialogRef.close(response);
    }
  }
}
