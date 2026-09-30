import { vehicle } from '@shared/models/customer/customer.model';
import { labor } from '@shared/models/labor/labor.model';
import { repairTask } from '@shared/models/repair-task/repair-task.model';

export enum spot {
  A = 0,
  B = 1,
  C = 2,
  D = 3,
}

export enum workOrderState {
  Scheduled = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface workOrder {
  workOrderId: string;
  invoiceId?: string;
  spot: spot;
  vehicle?: vehicle;
  startAtUtc: string;
  endAtUtc: string;
  repairTasks: repairTask[];
  labor?: labor;
  state: workOrderState;
  totalPartCost: number;
  totalLaborCost: number;
  totalCost: number;
  totalDurationInMins: number;
  createdAt: string;
  discount?: number;
  tax?: number;
}

export interface workOrderListItem {
  workOrderId: string;
  invoiceId?: string;
  vehicle: vehicle;
  customer?: string;
  labor?: string;
  state: workOrderState;
  spot: spot;
  startAtUtc: string;
  endAtUtc: string;
  repairTasks: string[];
  totalCost: number;
  paymentStatus?: string;
}

export interface workOrderFilterRequest {
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;
  state?: workOrderState;
  vehicleId?: string;
  laborId?: string;
  startDate?: string;
  endDate?: string;
  spot?: spot;
}
export interface assignLaborRequest {
  laborId: string;
}

export interface createWorkOrderRequest {
  spot: spot;
  vehicleId: string;
  repairTaskIds: string[];
  laborId: string;
  startAtUtc: string;
}

export interface modifyRepairTaskRequest {
  repairTaskIds: string[];
}

export interface relocateWorkOrderRequest {
  newStartAtUtc: string;
  newSpot: spot;
}

export interface updateWorkOrderStateRequest {
  state: workOrderState;
}
