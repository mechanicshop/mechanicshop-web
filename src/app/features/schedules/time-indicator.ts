import { Component, input, OnDestroy, OnInit, signal } from '@angular/core';

import { TimeSlots } from './time-slots';

@Component({
  selector: 'app-time-indicator',
  standalone: true,
  template: '',
  host: {
    '[style.top.px]': 'timeIndicatorTop()',
    '[style.left.px]': 'offsetLeft()',
    class: 'time-indicator',
  },
  styles: `
    :host {
      position: absolute;
      right: 0;
      border-top: 2px dotted var(--color-danger);
      z-index: 10;
      pointer-events: none;
    }
    :host::before {
      content: '';
      position: absolute;
      left: 0;
      top: -4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-danger);
    }
  `,
})
export class TimeIndicator implements OnInit, OnDestroy {
  offsetLeft = input(0);

  protected readonly timeIndicatorTop = signal<number>(0);
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.updateTimeIndicator();
    this.intervalId = setInterval(() => {
      this.updateTimeIndicator();
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateTimeIndicator(): void {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const totalMinutes = hours * 60 + minutes + seconds / 60;
    const pxPerMinute = TimeSlots.CELL_HEIGHT / 15;
    this.timeIndicatorTop.set(totalMinutes * pxPerMinute);
  }
}
