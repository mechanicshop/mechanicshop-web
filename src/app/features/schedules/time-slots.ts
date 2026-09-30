import { Component } from '@angular/core';

@Component({
  selector: 'app-time-slots',
  standalone: true,
  template: `
    <div class="time-grid">
      @for (slot of timeSlots; track slot) {
        <div class="time-cell">
          {{ slot }}
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 80px;
    }
    .time-grid {
      display: grid;
      grid-template-columns: 1fr;
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
      overflow: hidden;
    }
    .time-cell {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid var(--color-outline-variant);
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--color-muted);
    }
    .time-cell:last-child {
      border-bottom: none;
    }
  `,
})
export class TimeSlots {
  static readonly CELL_HEIGHT = 48;

  protected readonly timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  });
}
