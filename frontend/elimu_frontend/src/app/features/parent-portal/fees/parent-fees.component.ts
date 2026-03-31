import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentService } from '../../../core/services/parent.service';
import { Invoice } from '../../../core/models/finance.model';

@Component({
  selector: 'app-parent-fees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">Fees & Payments</h1>
      <p class="text-gray-600">View and manage all educational expenses for Leo Smith.</p>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="card bg-primary-600 text-white">
          <p class="text-sm text-white/80 uppercase mb-2">TOTAL OUTSTANDING FEES</p>
          <h2 class="text-4xl font-bold mb-3">{{ totalOutstanding() }}</h2>
          <div class="flex items-center space-x-2 text-sm mb-4">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>2 Overdue Invoices</span>
          </div>
          <button class="w-full bg-white text-primary-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors">
            Pay All Outstanding
          </button>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900">Stored Methods</h3>
            <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">Add New</button>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-100 rounded flex items-center justify-center">
                  <span class="text-primary-600 font-bold text-xs">VISA</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">•••• 4242</p>
                  <p class="text-xs text-gray-600">Expires 12/25</p>
                </div>
              </div>
              <button class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-600 mt-3">Next scheduled autopay: Sep 01, 2024</p>
        </div>

        <div class="space-y-4">
          <div class="card bg-primary-50">
            <p class="text-sm text-gray-600 uppercase mb-1">PAID THIS YEAR</p>
            <p class="text-2xl font-bold text-gray-900">$12,800</p>
          </div>
          <div class="card bg-success-50">
            <p class="text-sm text-gray-600 uppercase mb-1">FINANCIAL AID</p>
            <p class="text-2xl font-bold text-gray-900">15% Applied</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Recent Invoices</h3>
          <div class="flex items-center space-x-3">
            <button class="btn-secondary text-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            <button class="btn-secondary text-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Statement
            </button>
          </div>
        </div>

        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Invoice ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Due Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4 text-sm font-medium text-primary-600">INV-2024-081</td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Q3 Tuition Fees</p>
                <p class="text-xs text-gray-600">Academic Year 2024-25</p>
              </td>
              <td class="px-4 py-4 text-sm text-danger-600 font-medium">Aug 15, 2024</td>
              <td class="px-4 py-4 text-sm font-medium">$1,800.00</td>
              <td class="px-4 py-4"><span class="badge badge-danger">OVERDUE</span></td>
              <td class="px-4 py-4">
                <button class="btn-primary text-sm">Pay Now</button>
              </td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4 text-sm font-medium text-primary-600">INV-2024-094</td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Soccer Club Membership</p>
                <p class="text-xs text-gray-600">Extracurricular Activity</p>
              </td>
              <td class="px-4 py-4 text-sm">Sep 05, 2024</td>
              <td class="px-4 py-4 text-sm font-medium">$650.00</td>
              <td class="px-4 py-4"><span class="badge badge-warning">PENDING</span></td>
              <td class="px-4 py-4">
                <button class="btn-primary text-sm">Pay Now</button>
              </td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4 text-sm font-medium text-primary-600">INV-2024-067</td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Lab & Library Resources</p>
                <p class="text-xs text-gray-600">Annual Material Fee</p>
              </td>
              <td class="px-4 py-4 text-sm">Jul 20, 2024</td>
              <td class="px-4 py-4 text-sm font-medium">$420.00</td>
              <td class="px-4 py-4"><span class="badge badge-success">PAID</span></td>
              <td class="px-4 py-4">
                <button class="text-gray-600 hover:text-gray-900">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4 text-sm font-medium text-primary-600">INV-2024-052</td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Q2 Tuition Fees</p>
                <p class="text-xs text-gray-600">Academic Year 2024-25</p>
              </td>
              <td class="px-4 py-4 text-sm">May 15, 2024</td>
              <td class="px-4 py-4 text-sm font-medium">$1,800.00</td>
              <td class="px-4 py-4"><span class="badge badge-success">PAID</span></td>
              <td class="px-4 py-4">
                <button class="text-gray-600 hover:text-gray-900">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="flex items-center justify-center mt-4">
          <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All History →
          </button>
        </div>
      </div>
    </div>
  `
})
export class ParentFeesComponent implements OnInit {
  private parentService = inject(ParentService);
  
  totalOutstanding = signal(2450.00);
  invoices = signal<Invoice[]>([]);
  loading = signal(false);

  ngOnInit() {
    // Load data or use mock
  }
}
