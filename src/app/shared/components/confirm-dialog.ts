import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  iconColor?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIcon],
  template: `
    <div class="confirm-container">
      <div class="confirm-header">
        @if (data.icon) {
          <div class="icon-container" [class]="data.iconColor || 'warning'">
            <mat-icon>{{ data.icon }}</mat-icon>
          </div>
        }
        <h2 class="confirm-title">{{ data.title }}</h2>
      </div>
      <div class="confirm-body">
        <p>{{ data.message }}</p>
      </div>
      <div class="confirm-actions">
        <button (click)="onCancel()" mat-button>
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button (click)="onConfirm()" mat-flat-button color="warn">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 480px;
      max-width: 90vw;
    }
    .confirm-container {
      padding: 1.5rem;
      background-color: var(--color-bg);
    }
    .confirm-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .icon-container {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-container.danger {
      background-color: rgba(198, 40, 40, 0.1);
      color: var(--color-danger);
    }
    .icon-container.warning {
      background-color: rgba(181, 137, 0, 0.1);
      color: var(--color-warning);
    }
    .icon-container.info {
      background-color: rgba(2, 136, 209, 0.1);
      color: var(--color-info);
    }
    .confirm-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
    }
    .confirm-body {
      color: var(--color-muted);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `,
})
export class ConfirmDialog {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
