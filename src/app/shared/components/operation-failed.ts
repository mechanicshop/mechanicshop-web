import { Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-operation-failed',
  standalone: true,
  imports: [MatButton, MatIcon],
  template: `
    <div class="error-card">
      <div class="error-icon-container">
        <mat-icon>error_outline</mat-icon>
      </div>
      <div>
        <h3 class="error-title">{{ title() }}</h3>
        @if (message()) {
          <p class="error-message">
            {{ message() }}
          </p>
        }
      </div>
      <button class="error-button" (click)="retry.emit()" mat-stroked-button>Retry</button>
    </div>
  `,
  styles: `
    .error-card {
      max-width: 420px;
      margin-inline: auto;
      margin-block: 3rem;
      background-color: var(--color-surface);
      border-radius: var(--radius-md);
      padding: 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--color-outline-variant);
    }
    .error-icon-container {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-full);
      background-color: rgba(198, 40, 40, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-danger);
    }
    .error-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: var(--color-ink);
    }
    .error-message {
      font-size: 0.875rem;
      color: var(--color-muted);
      margin: 0;
      line-height: 1.5;
      margin-top: 0.25rem;
    }
    .error-button {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-danger);
      border-color: var(--color-danger);
      cursor: pointer;
    }
  `,
})
export class OperationFailed {
  readonly title = input.required<string>();
  readonly message = input<string>('');

  readonly retry = output<void>();
}
