import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delivery-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Delivery Logs & Analytics</h1>
          <p class="text-gray-600 mt-1">Real-time audit trail of all academic communications.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-600 uppercase">Delivery Rate (%)</p>
            <span class="text-success-600 text-sm font-medium">+2.4%</span>
          </div>
          <p class="text-4xl font-bold text-gray-900">98.2%</p>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-600 uppercase">Open Rate (%)</p>
            <span class="text-danger-600 text-sm font-medium">-0.8%</span>
          </div>
          <p class="text-4xl font-bold text-gray-900">74.5%</p>
        </div>

        <div class="card bg-danger-50">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-600 uppercase">Failed Messages</p>
            <span class="badge badge-danger text-xs">Low Risk</span>
          </div>
          <p class="text-4xl font-bold text-gray-900">14</p>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <select class="input text-sm">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
            <select class="input text-sm">
              <option>All Grades</option>
              <option>Grade 9</option>
              <option>Grade 10</option>
            </select>
            <select class="input text-sm">
              <option>All Channels</option>
              <option>Email</option>
              <option>SMS</option>
              <option>Push</option>
            </select>
            <button class="btn-secondary text-sm">Advanced Filters</button>
          </div>
          <button class="btn-primary text-sm">Export CSV</button>
        </div>

        <h3 class="font-semibold text-gray-900 mb-4">Detailed Message Log</h3>

        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student / Parent</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date & Time</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Channel</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Error Code</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 text-xs font-medium">AS</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Arthur Shelby</p>
                    <p class="text-xs text-gray-600">Parent of Thomas S.</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 24, 2023 • 10:14 AM</p>
              </td>
              <td class="px-4 py-4">
                <span class="badge badge-primary text-xs">Email</span>
              </td>
              <td class="px-4 py-4">
                <span class="badge badge-success">Delivered</span>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-gray-500">—</span>
              </td>
              <td class="px-4 py-4">
                <button class="text-gray-600 hover:text-gray-900">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr class="hover:bg-gray-50 bg-danger-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                    <span class="text-warning-600 text-xs font-medium">MK</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Mary Kaminski</p>
                    <p class="text-xs text-gray-600">Student (Grade 12)</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 24, 2023 • 09:45 AM</p>
              </td>
              <td class="px-4 py-4">
                <span class="badge badge-warning text-xs">SMS</span>
              </td>
              <td class="px-4 py-4">
                <span class="badge badge-danger">Failed</span>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-danger-600 font-mono">ERR_403_EXP</span>
              </td>
              <td class="px-4 py-4">
                <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Retry</button>
              </td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 text-xs font-medium">RJ</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Robert Johnson</p>
                    <p class="text-xs text-gray-600">Parent of Emily J.</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 24, 2023 • 08:30 AM</p>
              </td>
              <td class="px-4 py-4">
                <span class="badge badge-success text-xs">Push</span>
              </td>
              <td class="px-4 py-4">
                <span class="badge badge-primary">Sent</span>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-gray-500">—</span>
              </td>
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
              <td class="px-4 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 text-xs font-medium">LR</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Leo Richardson</p>
                    <p class="text-xs text-gray-600">Student (Grade 10)</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 23, 2023 • 04:12 PM</p>
              </td>
              <td class="px-4 py-4">
                <span class="badge badge-primary text-xs">Email</span>
              </td>
              <td class="px-4 py-4">
                <span class="badge badge-success">Delivered</span>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-gray-500">—</span>
              </td>
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

        <div class="flex items-center justify-between mt-4 pt-4 border-t">
          <p class="text-sm text-gray-600">Showing 1-4 of 1,240 messages</p>
          <div class="flex items-center space-x-2">
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" disabled>←</button>
            <button class="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">1</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">2</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">3</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">→</button>
          </div>
        </div>
      </div>

      <div class="card bg-primary-600 text-white">
        <h3 class="font-semibold mb-3">Automated Audit Summary</h3>
        <p class="text-sm text-white/90 mb-4">System analysis indicates a 95% deliverability health score. The most frequent failure reason is "Invalid Mobile Number" for SMS channels. We recommend a data verification campaign for Grade 12 parents.</p>
        <button class="bg-white text-primary-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-100">
          Run Health Audit
        </button>
      </div>
    </div>
  `
})
export class DeliveryLogsComponent {}
