export interface todayWorkOrderStats {
  date: string;
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  totalPartsCost: number;
  totalLaborCost: number;
  uniqueVehicles: number;
  uniqueCustomers: number;
  netProfit: number;
  profitMargin: number;
  completionRate: number;
  averageRevenuePerOrder: number;
  ordersPerVehicle: number;
  partsCostRatio: number;
  laborCostRatio: number;
  cancellationRate: number;
}
