export interface vehicle {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface customer {
  customerId: string;
  name: string;
  phoneNumber: string;
  email: string;
  vehicles: vehicle[];
}

export interface createVehicleRequest {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface createCustomerRequest {
  name: string;
  phoneNumber: string;
  email: string;
  vehicles: createVehicleRequest[];
}

export interface updateVehicleRequest {
  vehicleId?: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface updateCustomerRequest {
  name: string;
  phoneNumber: string;
  email: string;
  vehicles: updateVehicleRequest[];
}
