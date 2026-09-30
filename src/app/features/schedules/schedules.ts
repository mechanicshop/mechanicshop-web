import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { OperationFailed } from '@shared/components/operation-failed';
import { PageHeader } from '@shared/components/page-header';

import { ScheduleGrid } from './schedule-grid';
import { ScheduleStore } from './schedules.store';

interface ScheduleFormGroup {
  date: FormControl<Date | string | null>;
}

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [
    PageHeader,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatProgressSpinner,
    MatButtonModule,
    MatIconButton,
    MatIcon,
    OperationFailed,
    ScheduleGrid,
  ],
  providers: [provideNativeDateAdapter(), ScheduleStore],
  template: `
    <div>
      <main class="container page-layout">
        <div class="header">
          <app-page-header>
            <h1>Daily Schedule</h1>
            <p>View and manage daily mechanical workshop schedules.</p>
          </app-page-header>
          <div class="date-navigation">
            <button (click)="prevDay()" mat-icon-button type="button" aria-label="Previous day">
              <mat-icon>chevron_left</mat-icon>
            </button>

            <form [formGroup]="scheduleForm">
              <mat-form-field class="filter-field date-field" appearance="outline">
                <mat-label>Choose a date</mat-label>
                <input [matDatepicker]="picker" [formControl]="dateControl" matInput />
                <mat-datepicker-toggle [for]="picker" matIconSuffix></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </form>

            <button (click)="nextDay()" mat-icon-button type="button" aria-label="Next day">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>
        <div class="content">
          @if (store.isPending()('load-date')) {
            <div class="loading-container">
              <mat-progress-spinner mode="indeterminate" diameter="36" />
              <span class="loading-text">Loading schedule...</span>
            </div>
          } @else if (store.error()('load-date')) {
            <app-operation-failed
              [title]="'Failed to load schedule'"
              [message]="
                store.error()('load-date') ||
                'Could not load daily schedule. Please verify your connection.'
              "
              (retry)="retryLoad()"
            />
          } @else if (store.isFulfilled()('load-date')) {
            <div class="schedule-grid-container">
              <app-schedule-grid />
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: `
    .page-layout {
      padding-block: 2rem;
      display: flex;
      gap: 1rem;
      flex-direction: column;
    }
    .header {
      display: flex;
    }
    .date-navigation {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .date-field {
      max-width: 220px;
    }

    .schedule-grid-container {
      position: relative;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding-block: 3rem;
      color: var(--color-muted);
    }

    .loading-text {
      font-size: 0.875rem;
      font-weight: 500;
    }
  `,
})
export class Schedules implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly store = inject(ScheduleStore);
  protected readonly scheduleForm: FormGroup<ScheduleFormGroup> = this.fb.group<ScheduleFormGroup>({
    date: this.fb.control<Date | string | null>(new Date()),
  });

  ngOnInit(): void {
    this.dateControl.valueChanges.subscribe((value) => {
      if (value) {
        const date = typeof value === 'string' ? new Date(value) : value;
        this.store.load(date);
      }
    });

    const initialVal = this.dateControl.value;
    if (initialVal) {
      const date = typeof initialVal === 'string' ? new Date(initialVal) : initialVal;
      this.store.load(date);
    }
  }

  protected get dateControl() {
    return this.scheduleForm.controls.date;
  }

  protected prevDay(): void {
    const current = this.dateControl.value;
    if (current) {
      const date = typeof current === 'string' ? new Date(current) : new Date(current.getTime());
      date.setDate(date.getDate() - 1);
      this.dateControl.setValue(date);
    }
  }

  protected nextDay(): void {
    const current = this.dateControl.value;
    if (current) {
      const date = typeof current === 'string' ? new Date(current) : new Date(current.getTime());
      date.setDate(date.getDate() + 1);
      this.dateControl.setValue(date);
    }
  }

  protected retryLoad(): void {
    const current = this.dateControl.value;
    if (current) {
      const date = typeof current === 'string' ? new Date(current) : current;
      this.store.load(date);
    }
  }
}
