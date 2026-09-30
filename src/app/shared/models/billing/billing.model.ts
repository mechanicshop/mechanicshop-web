import { customer, vehicle } from '@shared/models/customer/customer.model';

export interface invoiceLineItem {
  invoiceId: string;
  lineNumber: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface invoice {
  invoiceId: string;
  workOrderId: string;
  issuedAtUtc: string;
  customer?: customer;
  vehicle?: vehicle;
  discountAmount?: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentStatus?: string;
  items: invoiceLineItem[];
}

export interface invoicePdf {
  content?: string;
  fileName?: string;
  contentType?: string;
}
