import { labor } from '@shared/models/labor/labor.model';
import { repairTask } from '@shared/models/repair-task/repair-task.model';
import { spot, workOrderState } from '@shared/models/work-order/work-order.model';

export interface availabilitySlot {
  workOrderId?: string;
  spot: spot;
  startAt: string;
  endAt: string;
  vehicle?: string;
  labor?: labor;
  isOccupied: boolean;
  isAvailable?: boolean;
  workOrderLocked: boolean;
  state?: workOrderState;
  repairTasks?: repairTask[];
}

export interface spotDto {
  spot: spot;
  slots: availabilitySlot[];
}

export interface schedule {
  onDate: string;
  endOfDay: boolean;
  spots: spotDto[];
}
