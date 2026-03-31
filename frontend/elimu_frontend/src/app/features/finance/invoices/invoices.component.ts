import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Invoices</h1>
          <p class="text-gray-600 mt-1">Manage and track all student financial records</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">Download PDF</button>
          <button class="btn-secondary">Bulk Send Reminder</button>
        </div>
      </div>

      <div class="card">
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div><label class="block text-sm font-medium text-gray-700 mb-2">DATE RANGE</label><select class="input"><option>Current Semester</option></select></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">STATUS</label><select class="input"><option>All Statuses</option></select></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">GRADE / SECTION</label><select class="input"><option>All Grades</option></select></div>
          <div class="flex items-end"><div class="text-right w-full"><p class="text-sm text-gray-600">TOTAL OUTSTANDING</p><p class="text-2xl font-bold text-primary-600">$42,150.00</p></div></div>
        </div>

        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left"><input type="checkbox" class="rounded" /></th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Invoice ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Due Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Method</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3"><input type="checkbox" class="rounded" /></td>
              <td class="px-4 py-3 text-sm text-primary-600 font-medium">#INV-2024-001</td>
              <td class="px-4 py-3"><div class="flex items-center space-x-2"><div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><span class="text-primary-600 text-xs font-medium">JD</span></div><div><p class="text-sm font-medium">Jameson Doe</p><p class="text-xs text-gray-500">Grade 4 - Section B</p></div></div></td>
              <td class="px-4 py-3 text-sm font-medium">$1,250.00</td>
              <td class="px-4 py-3 text-sm">Oct 12, 2024</td>
              <td class="px-4 py-3"><span class="badge badge-danger">OVERDUE</span></td>
              <td class="px-4 py-3"><span class="text-sm">🏦 Bank</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3"><input type="checkbox" class="rounded" /></td>
              <td class="px-4 py-3 text-sm text-primary-600 font-medium">#INV-2024-002</td>
              <td class="px-4 py-3"><div class="flex items-center space-x-2"><div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><span class="text-primary-600 text-xs font-medium">SM</span></div><div><p class="text-sm font-medium">Sarah Miller</p><p class="text-xs text-gray-500">Grade 2 - Section A</p></div></div></td>
              <td class="px-4 py-3 text-sm font-medium">$950.00</td>
              <td class="px-4 py-3 text-sm">Oct 15, 2024</td>
              <td class="px-4 py-3"><span class="badge badge-success">PAID</span></td>
              <td class="px-4 py-3"><span class="text-sm">📱 M-Pesa</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InvoicesComponent {}
