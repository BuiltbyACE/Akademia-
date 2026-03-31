import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FinanceService } from '../../../core/services/finance.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-finance-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Finance Overview</h1>
          <p class="text-gray-600 mt-1">Real-time fiscal monitoring for Academic Year 2024-25</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">Generate Report</button>
          <button class="btn-primary">+ Quick Action</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card title="Total Revenue" value="$1,482,000" [change]="12.4" icon="dollar" iconBg="bg-success-100" iconColor="text-success-600" />
        <app-stat-card title="Outstanding Fees" value="$245,600" badge="Aging: 15d" icon="alert" iconBg="bg-danger-100" iconColor="text-danger-600" />
        <app-stat-card title="Total Expenses" value="$894,300" [change]="-2.1" icon="dollar" iconBg="bg-gray-100" iconColor="text-gray-600" />
        <app-stat-card title="Collection Rate" value="86.4%" badge="Target 90%" icon="check" iconBg="bg-primary-100" iconColor="text-primary-600" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 card">
          <h3 class="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p class="text-gray-500">Revenue chart placeholder</p>
          </div>
        </div>
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Fee by Grade</h3>
          <div class="space-y-3">
            <div><div class="flex justify-between text-sm mb-1"><span>Senior High (Gr 11-12)</span><span class="font-medium">$450k</span></div><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-primary-600 h-2 rounded-full" style="width: 90%"></div></div></div>
            <div><div class="flex justify-between text-sm mb-1"><span>Junior High (Gr 7-10)</span><span class="font-medium">$380k</span></div><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-primary-600 h-2 rounded-full" style="width: 76%"></div></div></div>
            <div><div class="flex justify-between text-sm mb-1"><span>Primary (Gr 1-6)</span><span class="font-medium">$510k</span></div><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-primary-600 h-2 rounded-full" style="width: 85%"></div></div></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Recent Transactions</h3>
          <a routerLink="/finance/invoices" class="text-sm text-primary-600 hover:text-primary-700 font-medium">View All →</a>
        </div>
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Invoice ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr><td class="px-4 py-3 text-sm">Adrian Hoffman</td><td class="px-4 py-3 text-sm text-primary-600">#INV-2024-0012</td><td class="px-4 py-3 text-sm">Oct 24, 2023</td><td class="px-4 py-3 text-sm font-medium">$1,250.00</td><td class="px-4 py-3"><span class="badge badge-success">PAID</span></td></tr>
            <tr><td class="px-4 py-3 text-sm">Elena Jenkins</td><td class="px-4 py-3 text-sm text-primary-600">#INV-2024-0015</td><td class="px-4 py-3 text-sm">Oct 23, 2023</td><td class="px-4 py-3 text-sm font-medium">$850.00</td><td class="px-4 py-3"><span class="badge badge-warning">PENDING</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class FinanceOverviewComponent implements OnInit {
  private financeService = inject(FinanceService);

  ngOnInit() {
    // Load data
  }
}
