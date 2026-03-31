import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';
import { 
  Invoice, 
  Payment, 
  FeeStructure, 
  FinanceOverview 
} from '../models/finance.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private api = inject(ApiService);

  getFinanceOverview(): Observable<FinanceOverview> {
    return this.api.get<FinanceOverview>('/api/v1/finance/overview/');
  }

  getInvoices(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    grade?: string;
    section?: string;
    date_from?: string;
    date_to?: string;
  }): Observable<PaginatedResponse<Invoice>> {
    return this.api.get<PaginatedResponse<Invoice>>('/api/v1/finance/invoices/', params);
  }

  getInvoice(id: string): Observable<Invoice> {
    return this.api.get<Invoice>(`/api/v1/finance/invoices/${id}/`);
  }

  createInvoice(data: Partial<Invoice>): Observable<Invoice> {
    return this.api.post<Invoice>('/api/v1/finance/invoices/', data);
  }

  bulkSendReminder(invoiceIds: string[]): Observable<any> {
    return this.api.post('/api/v1/finance/invoices/bulk-reminder/', { invoice_ids: invoiceIds });
  }

  initiatePayment(invoiceId: string, phoneNumber: string): Observable<any> {
    return this.api.post(`/api/v1/finance/invoices/${invoiceId}/pay/`, { phone_number: phoneNumber });
  }

  getFeeStructures(): Observable<FeeStructure[]> {
    return this.api.get<FeeStructure[]>('/api/v1/finance/fee-structures/');
  }

  getFeeStructure(id: string): Observable<FeeStructure> {
    return this.api.get<FeeStructure>(`/api/v1/finance/fee-structures/${id}/`);
  }

  createFeeStructure(data: Partial<FeeStructure>): Observable<FeeStructure> {
    return this.api.post<FeeStructure>('/api/v1/finance/fee-structures/', data);
  }

  updateFeeStructure(id: string, data: Partial<FeeStructure>): Observable<FeeStructure> {
    return this.api.patch<FeeStructure>(`/api/v1/finance/fee-structures/${id}/`, data);
  }

  publishFeeStructure(id: string): Observable<FeeStructure> {
    return this.api.post<FeeStructure>(`/api/v1/finance/fee-structures/${id}/publish/`, {});
  }
}
