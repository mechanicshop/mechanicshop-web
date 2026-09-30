import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { ConfirmDialog, ConfirmDialogData } from '@shared/components/confirm-dialog';
import { availabilitySlot } from '@shared/models/scheduling/scheduling.model';
import { spot } from '@shared/models/work-order/work-order.model';

import {
  ModifyWorkorderTasksDialog,
  ModifyWorkorderTasksDialogData,
} from './modify-workorder-tasks-dialog';
import { NewWorkOrderDialog, NewWorkOrderDialogData } from './new-workorder-dialog';
import { ReassignLaborDialog, ReassignLaborDialogData } from './reassign-labor-dialog';
import { RelocateWorkorderDialog, RelocateWorkorderDialogData } from './relocate-workorder-dialog';
import { ScheduleStore } from './schedules.store';
import { TimeIndicator } from './time-indicator';
import {
  UpdateWorkorderStateDialog,
  UpdateWorkorderStateDialogData,
} from './update-workorder-state-dialog';

const MIN_PER_CELL = 15;
const TOTAL_CELLS = 24 * 4;

function getMinutesFromMidnight(isoString: string): number {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
}

function getRowFromTime(isoString: string): number {
  const mins = getMinutesFromMidnight(isoString);
  return Math.floor(mins / MIN_PER_CELL) + 1;
}

function getRowSpan(slot: availabilitySlot): number {
  const start = new Date(slot.startAt).getTime();
  const end = new Date(slot.endAt).getTime();
  const diffMin = (end - start) / 60000;
  return Math.max(1, Math.round(diffMin / MIN_PER_CELL));
}

function spotLabel(s: spot): string {
  switch (s) {
    case spot.A:
      return 'A';
    case spot.B:
      return 'B';
    case spot.C:
      return 'C';
    case spot.D:
      return 'D';
  }
}

@Component({
  selector: 'app-schedule-grid',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, TimeIndicator],
  template: `
    <div class="schedule-wrapper">
      <div class="header-row">
        <div class="header-cell header-time">Time</div>
        @for (s of store.schedule()?.spots ?? []; track s.spot) {
          <div class="header-cell">Spot {{ spotLabel(s.spot) }}</div>
        }
      </div>

      <div class="grid-container">
        <app-time-indicator [offsetLeft]="80" />

        <div class="grid">
          @for (lbl of timeLabels; track $index) {
            <div class="time-cell" [style.gridRow]="$index + 1" style="grid-column: 1">
              {{ lbl }}
            </div>
          }

          @for (s of store.schedule()?.spots ?? []; track s.spot; let col = $index) {
            @for (sl of s.slots; track sl.startAt) {
              @if (sl.isOccupied) {
                <div
                  class="slot occupied"
                  [style.gridRow]="getRowFromTime(sl.startAt) + ' / span ' + getRowSpan(sl)"
                  [style.gridColumn]="col + 2"
                  [class.locked]="sl.workOrderLocked"
                >
                  <div class="slot-content">
                    <div class="slot-labor">{{ sl.labor?.name || 'Unassigned' }}</div>
                    <div class="slot-vehicle">{{ sl.vehicle || '' }}</div>
                    @if (!store.schedule()?.endOfDay) {
                      <div class="slot-actions">
                        <button
                          (click)="openUpdateState(sl)"
                          mat-icon-button
                          type="button"
                          matTooltip="Update State"
                        >
                          <mat-icon>sync_alt</mat-icon>
                        </button>
                        <button
                          (click)="openReassignLabor(sl)"
                          mat-icon-button
                          type="button"
                          matTooltip="Reassign Labor"
                        >
                          <mat-icon>assignment_ind</mat-icon>
                        </button>
                        <button
                          (click)="openModifyTasks(sl)"
                          mat-icon-button
                          type="button"
                          matTooltip="Modify Tasks"
                        >
                          <mat-icon>edit_note</mat-icon>
                        </button>
                        <button
                          (click)="openRelocate(sl)"
                          mat-icon-button
                          type="button"
                          matTooltip="Relocate"
                        >
                          <mat-icon>open_in_new</mat-icon>
                        </button>
                        <button
                          (click)="openDeleteConfirm(sl)"
                          mat-icon-button
                          type="button"
                          matTooltip="Delete"
                        >
                          <mat-icon>delete</mat-icon>
                        </button>
                        <a
                          [routerLink]="['/workorders', sl.workOrderId]"
                          mat-icon-button
                          matTooltip="View Details"
                        >
                          <mat-icon>visibility</mat-icon>
                        </a>
                      </div>
                    } @else {
                      <a class="view-btn" [routerLink]="['/workorders', sl.workOrderId]" mat-button>
                        <mat-icon>visibility</mat-icon>
                        View Details
                      </a>
                    }
                  </div>
                </div>
              } @else {
                @if (!store.schedule()?.endOfDay) {
                  <button
                    class="slot empty clickable"
                    [class.unavailable]="!slotIsAvailable(sl)"
                    [style.gridRow]="getRowFromTime(sl.startAt)"
                    [style.gridColumn]="col + 2"
                    (click)="openNewWorkOrder(sl)"
                    type="button"
                  >
                    <mat-icon class="add-icon">add</mat-icon>
                  </button>
                } @else {
                  <div
                    class="slot empty unavailable"
                    [style.gridRow]="getRowFromTime(sl.startAt)"
                    [style.gridColumn]="col + 2"
                  ></div>
                }
              }
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .schedule-wrapper {
      display: flex;
      flex-direction: column;
    }

    .header-row {
      display: grid;
      grid-template-columns: 80px repeat(4, 1fr);
      gap: 0;
      position: sticky;
      top: 0;
      z-index: 5;
      background: var(--color-bg);
      border-bottom: 2px solid var(--color-outline-variant);
    }

    .header-cell {
      padding: 0.5rem;
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--color-ink);
      text-align: center;
      &:not(:last-child) {
        border-right: 1px solid var(--color-outline-variant);
      }
    }

    .header-time {
      text-align: left;
    }

    .grid-container {
      position: relative;
    }

    .grid {
      display: grid;
      grid-template-columns: 80px repeat(4, 1fr);
      grid-auto-rows: 48px;
    }

    .time-cell {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid var(--color-outline-variant);
      border-bottom: 1px solid var(--color-outline-variant);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-muted);
    }

    .slot {
      overflow: hidden;
    }

    .slot.occupied {
      background: var(--color-surface);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-md);
      padding: 4px 6px;
      margin: 1px;
      z-index: 2;
      box-shadow: var(--shadow-sm);
    }
    .slot.occupied.locked {
      opacity: 0.7;
      background: var(--color-outline-variant);
    }

    .slot-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      height: 100%;
    }

    .slot-labor {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .slot-vehicle {
      font-size: 0.65rem;
      color: var(--color-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .slot-actions {
      display: flex;
      gap: 1px;
      flex-wrap: wrap;
      margin-top: auto;
      padding-top: 2px;

      button,
      a {
        width: 24px;
        height: 24px;
        line-height: 24px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          line-height: 16px;
        }
      }
    }

    .view-btn {
      font-size: 0.7rem;
      line-height: 28px;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        line-height: 14px;
      }
    }

    .slot.empty {
      border-bottom: 1px solid var(--color-outline-variant);
      border-right: 1px solid var(--color-outline-variant);
      height: 48px;
      background: transparent;
    }

    .slot.empty.clickable {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      border: none;
      width: 100%;
      padding: 0;
    }
    .slot.empty.clickable:hover {
      background: var(--color-primary-container);
    }

    .slot.empty.unavailable {
      opacity: 0.3;
    }
    button[mat-icon-button],
    a[mat-icon-button] {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .add-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      line-height: 18px;
      color: var(--color-muted);
      opacity: 0.6;
    }
    .slot.empty.clickable:hover .add-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  `,
})
export class ScheduleGrid {
  private readonly dialog = inject(MatDialog);
  protected readonly store = inject(ScheduleStore);

  protected readonly timeLabels = Array.from({ length: TOTAL_CELLS }, (_, i) => {
    const h = Math.floor(i / 4);
    const m = (i % 4) * 15;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  });

  protected getRowFromTime = getRowFromTime;
  protected getRowSpan = getRowSpan;
  protected spotLabel = spotLabel;

  /** Computed client-side instead of relying on potentially stale backend cache. */
  protected slotIsAvailable(slot: availabilitySlot): boolean {
    return new Date(slot.startAt) > new Date();
  }

  protected openNewWorkOrder(slot: availabilitySlot): void {
    const startDate = new Date(slot.startAt);
    const data: NewWorkOrderDialogData = {
      defaultDate: startDate,
      defaultSpot: slot.spot,
    };
    const ref = this.dialog.open(NewWorkOrderDialog, { data });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.store.createWorkOrder(result);
      }
    });
  }

  protected openUpdateState(slot: availabilitySlot): void {
    const data: UpdateWorkorderStateDialogData = {
      currentState: slot.state,
    };
    const ref = this.dialog.open(UpdateWorkorderStateDialog, { data });
    ref.afterClosed().subscribe((result) => {
      if (result && slot.workOrderId) {
        this.store.updateWorkOrderState(slot.workOrderId, result);
      }
    });
  }

  protected openReassignLabor(slot: availabilitySlot): void {
    const data: ReassignLaborDialogData = {
      currentLaborId: slot.labor?.laborId,
    };
    const ref = this.dialog.open(ReassignLaborDialog, { data });
    ref.afterClosed().subscribe((result) => {
      if (result && slot.workOrderId) {
        this.store.reassignLabor(slot.workOrderId, result);
      }
    });
  }

  protected openModifyTasks(slot: availabilitySlot): void {
    const data: ModifyWorkorderTasksDialogData = {
      currentRepairTaskIds: slot.repairTasks?.map((t) => t.repairTaskId),
    };
    const ref = this.dialog.open(ModifyWorkorderTasksDialog, { data });
    ref.afterClosed().subscribe((result) => {
      if (result && slot.workOrderId) {
        this.store.modifyWorkOrderTasks(slot.workOrderId, result);
      }
    });
  }

  protected openRelocate(slot: availabilitySlot): void {
    const data: RelocateWorkorderDialogData = {
      currentSpot: slot.spot,
      currentStartAtUtc: slot.startAt,
    };
    const ref = this.dialog.open(RelocateWorkorderDialog, { data });
    ref.afterClosed().subscribe((result) => {
      if (result && slot.workOrderId) {
        this.store.relocateWorkOrder(slot.workOrderId, result);
      }
    });
  }

  protected openDeleteConfirm(slot: availabilitySlot): void {
    const data: ConfirmDialogData = {
      title: 'Delete Work Order',
      message: `Are you sure you want to delete this work order${slot.vehicle ? ' for ' + slot.vehicle : ''}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      icon: 'warning_amber',
      iconColor: 'danger',
    };
    const ref = this.dialog.open(ConfirmDialog, { data });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed && slot.workOrderId) {
        this.store.deleteWorkOrder(slot.workOrderId);
      }
    });
  }
}
