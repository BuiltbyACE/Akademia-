import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationsService } from '../../../core/services/communications.service';

@Component({
  selector: 'app-sent-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Sent Messages</h1>
          <p class="text-gray-600 mt-1">Track outgoing school communications across SMS, Email, and Push notification channels.</p>
        </div>
        <button class="btn-primary" routerLink="/communications/compose">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Compose Message
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card bg-success-50">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600 uppercase">Delivery Rate</p>
              <p class="text-3xl font-bold text-gray-900">98.4%</p>
            </div>
          </div>
        </div>

        <div class="card bg-primary-50">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600 uppercase">Messages Sent</p>
              <p class="text-3xl font-bold text-gray-900">4.2k</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <button class="badge badge-primary">Last 30 Days</button>
          </div>
          <div class="flex items-center space-x-3">
            <button class="btn-secondary text-sm">Export CSV</button>
            <button class="btn-secondary text-sm">Bulk Actions</button>
          </div>
        </div>

        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Channel</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Recipient</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Subject</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span class="text-sm">Email</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Sarah Mitchell</p>
                <p class="text-xs text-gray-600">Grade 4 Parent Group</p>
              </td>
              <td class="px-4 py-4 text-sm">Field Trip Permission Reminder: Zoo...</td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 24, 2023</p>
                <p class="text-xs text-gray-600">09:45 AM</p>
              </td>
              <td class="px-4 py-4"><span class="badge badge-success">Read</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span class="text-sm">SMS</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">David Chen</p>
                <p class="text-xs text-gray-600">Emergency Contact</p>
              </td>
              <td class="px-4 py-4 text-sm">School Bus Delay - Route 42</td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 24, 2023</p>
                <p class="text-xs text-gray-600">08:12 AM</p>
              </td>
              <td class="px-4 py-4"><span class="badge badge-primary">Delivered</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span class="text-sm">Push</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Whole School</p>
                <p class="text-xs text-gray-600">Staff & Parents (1.2k)</p>
              </td>
              <td class="px-4 py-4 text-sm">Inclement Weather Update - Closing...</td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 23, 2023</p>
                <p class="text-xs text-gray-600">07:00 PM</p>
              </td>
              <td class="px-4 py-4"><span class="badge badge-success">Sent</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span class="text-sm">Email</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Mark Thompson</p>
                <p class="text-xs text-gray-600">Billing Department</p>
              </td>
              <td class="px-4 py-4 text-sm">Tuition Invoice #8841-B</td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 23, 2023</p>
                <p class="text-xs text-gray-600">02:30 PM</p>
              </td>
              <td class="px-4 py-4"><span class="badge badge-danger">Failed</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span class="text-sm">Email</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Elena Rodriguez</p>
                <p class="text-xs text-gray-600">PTA Board</p>
              </td>
              <td class="px-4 py-4 text-sm">Monthly PTA Meeting Agenda</td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 23, 2023</p>
                <p class="text-xs text-gray-600">10:15 AM</p>
              </td>
              <td class="px-4 py-4"><span class="badge badge-primary">Delivered</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span class="text-sm">SMS</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Jordan Smith</p>
                <p class="text-xs text-gray-600">Individual Contact</p>
              </td>
              <td class="px-4 py-4 text-sm">Please confirm meeting time for...</td>
              <td class="px-4 py-4">
                <p class="text-sm text-gray-900">Oct 22, 2023</p>
                <p class="text-xs text-gray-600">04:45 PM</p>
              </td>
              <td class="px-4 py-4"><span class="badge badge-success">Read</span></td>
            </tr>
          </tbody>
        </table>

        <div class="flex items-center justify-between mt-4 pt-4 border-t">
          <p class="text-sm text-gray-600">Showing 1 to 10 of 4,212 entries</p>
          <div class="flex items-center space-x-2">
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">1</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">2</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">3</button>
            <span class="text-gray-500">...</span>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">422</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">→</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SentMessagesComponent implements OnInit {
  private communicationsService = inject(CommunicationsService);
  
  loading = signal(false);

  ngOnInit() {
    // Load sent messages
  }
}
