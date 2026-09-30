import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { Observable } from 'rxjs';

import {
  createCustomerRequest,
  customer,
  updateCustomerRequest,
} from '@shared/models/customer/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private settings = inject(APP_SETTINGS);

  private get baseUrl(): string {
    return `${this.settings.apiBaseUrl}/api/v1/customers`;
  }

  getCustomers(): Observable<customer[]> {
    return this.http.get<customer[]>(this.baseUrl);
  }

  getCustomerById(customerId: string): Observable<customer> {
    return this.http.get<customer>(`${this.baseUrl}/${customerId}`);
  }

  createCustomer(request: createCustomerRequest): Observable<customer> {
    return this.http.post<customer>(this.baseUrl, request);
  }

  updateCustomer(customerId: string, request: updateCustomerRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${customerId}`, request);
  }

  removeCustomer(customerId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${customerId}`);
  }
}
