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
  customer,
  createCustomerRequest,
  updateCustomerRequest,
} from '@shared/models/customer/customer.model';
import { CustomerService } from '@shared/services/customer.service';
import { getApiErrorMessage } from '@shared/utils/utilities';

import { CustomerDialog, CustomerDialogData } from './customer-dialog';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
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
        <app-page-header>
          <h1>Customers</h1>
          <p>Manage shop customers and their associated vehicles.</p>
          <button
            class="header-action-btn"
            (click)="openCreateModal()"
            mat-flat-button
            color="primary"
          >
            <mat-icon>add</mat-icon>
            Add Customer
          </button>
        </app-page-header>

        @if (isLoading()) {
          <div class="loading-container">
            <mat-progress-spinner mode="indeterminate" diameter="48" />
            <span class="loading-text">Loading customers...</span>
          </div>
        } @else if (error()) {
          <app-operation-failed
            [title]="'Failed to load customers'"
            [message]="'Could not connect to the backend server. Please verify your connection.'"
            (retry)="customerResource.reload()"
          />
        } @else {
          <div class="search-sort-bar">
            <mat-form-field class="search-field" appearance="outline">
              <mat-label>Search customers</mat-label>
              <input
                [(ngModel)]="searchTerms"
                matInput
                placeholder="Search by name, email, phone or vehicle..."
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field class="sort-prop-field" appearance="outline">
              <mat-label>Sort By</mat-label>
              <mat-select [(ngModel)]="sortProperty">
                <mat-option value="name">Name</mat-option>
                <mat-option value="email">Email</mat-option>
                <mat-option value="vehiclesCount">Vehicles Count</mat-option>
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

          @if (filteredCustomers().length === 0) {
            <app-empty-state
              title="No customers found"
              message="Try refining your search terms or click 'Add Customer' to register a new one."
            />
          } @else {
            <div class="customers-grid">
              @for (c of filteredCustomers(); track c.customerId) {
                <div class="customer-card">
                  <div class="card-header">
                    <h3 class="customer-name">{{ c.name }}</h3>
                    <button
                      class="actions-btn"
                      [matMenuTriggerFor]="cardMenu"
                      mat-icon-button
                      aria-label="Actions"
                    >
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #cardMenu="matMenu">
                      <button (click)="openEditModal(c)" mat-menu-item>
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button
                        class="text-danger"
                        (click)="onDeleteCustomer(c.customerId)"
                        mat-menu-item
                      >
                        <mat-icon color="warn">delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </div>

                  <div class="meta-row">
                    <mat-icon class="meta-icon">phone</mat-icon>
                    <span class="meta-text">{{ c.phoneNumber }}</span>
                  </div>

                  <div class="meta-row">
                    <mat-icon class="meta-icon">email</mat-icon>
                    <span class="meta-text">{{ c.email }}</span>
                  </div>

                  <div class="vehicles-container">
                    <span class="vehicles-label">Vehicles:</span>
                    <div class="vehicles-list">
                      @for (v of c.vehicles; track v.vehicleId) {
                        <span class="vehicle-badge">
                          {{ v.make }} {{ v.model }} ({{ v.year }}) - {{ v.licensePlate }}
                        </span>
                      }
                    </div>
                  </div>

                  <div class="card-footer">
                    <span class="vehicles-count-label">Total Registered</span>
                    <span class="vehicles-count-value">
                      {{ c.vehicles ? c.vehicles.length : 0 }}
                      {{ (c.vehicles ? c.vehicles.length : 0) === 1 ? 'Vehicle' : 'Vehicles' }}
                    </span>
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
    .page-layout {
      padding-block: 2rem;
    }
    .header-action-btn {
      height: 40px;
      border-radius: var(--radius-md);
      font-weight: 500;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
    }
    .loading-text {
      font-size: 0.875rem;
      color: var(--color-muted);
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
    .customers-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (width >= 1024px) {
      .customers-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .customer-card {
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
    .customer-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .actions-btn {
      color: var(--color-muted);
      margin-top: -0.25rem;
      margin-right: -0.5rem;
    }
    .meta-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .meta-icon {
      font-size: 1.1rem;
      width: 18px;
      height: 18px;
      color: var(--color-muted);
    }
    .meta-text {
      font-size: 0.875rem;
      color: var(--color-muted-foreground);
    }
    .vehicles-container {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-top: 0.5rem;
      margin-bottom: 1rem;
    }
    .vehicles-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .vehicles-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .vehicle-badge {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      background-color: var(--color-surface-variant);
      color: var(--color-ink-variant);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-outline-variant);
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--color-outline-variant);
    }
    .vehicles-count-label {
      font-size: 0.75rem;
      color: var(--color-muted);
      font-weight: 500;
    }
    .vehicles-count-value {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-primary);
    }
    .text-danger {
      color: var(--color-danger);
    }
  `,
})
export class Customers {
  private readonly customerService = inject(CustomerService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly searchTerms = signal('');
  protected readonly sortProperty = signal<string>('name');
  protected readonly sortDirection = signal<string>('asc');

  readonly customerResource = rxResource({
    stream: () => this.customerService.getCustomers(),
  });

  protected readonly isLoading = this.customerResource.isLoading;
  protected readonly error = this.customerResource.error;

  protected readonly filteredCustomers = computed(() => {
    const customers = this.customerResource.value() || [];
    const search = this.searchTerms().toLowerCase().trim();
    const prop = this.sortProperty();
    const dir = this.sortDirection();

    let result = [...customers];

    if (search) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.phoneNumber.toLowerCase().includes(search) ||
          (c.vehicles &&
            c.vehicles.some(
              (v) =>
                v.make.toLowerCase().includes(search) ||
                v.model.toLowerCase().includes(search) ||
                v.licensePlate.toLowerCase().includes(search) ||
                v.year.toString().includes(search),
            )),
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (prop) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'vehiclesCount': {
          const countA = a.vehicles ? a.vehicles.length : 0;
          const countB = b.vehicles ? b.vehicles.length : 0;
          comparison = countA - countB;
          break;
        }
      }
      return dir === 'asc' ? comparison : -comparison;
    });

    return result;
  });

  protected openCreateModal(): void {
    const dialogRef = this.dialog.open<CustomerDialog, CustomerDialogData, createCustomerRequest>(
      CustomerDialog,
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.customerService.createCustomer(result).subscribe({
          next: () => {
            this.showSnackBar('Customer created successfully!', false);
            this.customerResource.reload();
          },
          error: (err) => {
            this.showSnackBar(
              getApiErrorMessage(err, 'Operation failed: Could not create the customer.'),
              true,
            );
          },
        });
      }
    });
  }

  protected openEditModal(c: customer): void {
    const dialogRef = this.dialog.open<
      CustomerDialog,
      { customer: customer },
      updateCustomerRequest
    >(CustomerDialog, {
      data: { customer: c },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.customerService.updateCustomer(c.customerId, result).subscribe({
          next: () => {
            this.showSnackBar('Customer updated successfully!', false);
            this.customerResource.reload();
          },
          error: (err) => {
            this.showSnackBar(
              getApiErrorMessage(err, 'Operation failed: Could not update the customer.'),
              true,
            );
          },
        });
      }
    });
  }

  protected onDeleteCustomer(customerId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Customer',
        message:
          'Are you sure you want to delete this customer? This will also remove all associated vehicles. This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'warning',
        iconColor: 'danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.customerService.removeCustomer(customerId).subscribe({
          next: () => {
            this.showSnackBar('Customer deleted successfully!', false);
            this.customerResource.reload();
          },
          error: (err) => {
            this.showSnackBar(
              getApiErrorMessage(err, 'Operation failed: Could not delete the customer.'),
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
