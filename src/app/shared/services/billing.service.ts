import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { APP_SETTINGS } from '@Core/config/app.settings';
import { Observable } from 'rxjs';

import { invoice } from '@shared/models/billing/billing.model';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private http = inject(HttpClient);
  private settings = inject(APP_SETTINGS);

  private get baseUrl(): string {
    return `${this.settings.apiBaseUrl}/api/v1/invoices`;
  }

  getInvoiceById(invoiceId: string): Observable<invoice> {
    return this.http.get<invoice>(`${this.baseUrl}/${invoiceId}`);
  }

  getInvoicePdf(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${invoiceId}/pdf`, { responseType: 'blob' });
  }

  issueInvoiceForWorkOrder(workOrderId: string): Observable<invoice> {
    return this.http.post<invoice>(`${this.baseUrl}/workorders/${workOrderId}`, {});
  }
}
