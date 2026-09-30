export enum repairDurationInMinutes {
  Min15 = 15,
  Min30 = 30,
  Min45 = 45,
  Min60 = 60,
  Min75 = 75,
  Min90 = 90,
  Min105 = 105,
  Min120 = 120,
  Min135 = 135,
  Min150 = 150,
  Min165 = 165,
  Min180 = 180,
}

export interface part {
  partId: string;
  name: string;
  cost: number;
  quantity: number;
}

export interface repairTask {
  repairTaskId: string;
  name: string;
  estimatedDurationInMins: repairDurationInMinutes;
  laborCost: number;
  totalCost: number;
  parts: part[];
}

export interface createRepairTaskPartRequest {
  name: string;
  cost: number;
  quantity: number;
}

export interface createRepairTaskRequest {
  name: string;
  laborCost: number;
  estimatedDurationInMins: repairDurationInMinutes;
  parts: createRepairTaskPartRequest[];
}

export interface updateRepairTaskPartRequest {
  partId?: string;
  name: string;
  cost: number;
  quantity: number;
}

export interface updateRepairTaskRequest {
  name: string;
  laborCost: number;
  estimatedDurationInMins: repairDurationInMinutes;
  parts: updateRepairTaskPartRequest[];
}
