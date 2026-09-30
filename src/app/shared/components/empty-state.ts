import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIcon],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding-block: 4rem;
      border: 1px dashed var(--color-outline);
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      color: var(--color-muted);
    }
    .empty-state mat-icon {
      font-size: 3rem;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-ink);
      margin-bottom: 0.25rem;
    }
    .empty-state p {
      font-size: 0.875rem;
    }
  `,
})
export class EmptyState {
  readonly icon = input<string>('search_off');
  readonly title = input.required<string>();
  readonly message = input<string>('');
}
