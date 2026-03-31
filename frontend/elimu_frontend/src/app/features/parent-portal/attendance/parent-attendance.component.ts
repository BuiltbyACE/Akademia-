import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParentService } from '../../../core/services/parent.service';
import { AttendanceCalendar, AttendanceDay } from '../../../core/models/parent.model';

@Component({
  selector: 'app-parent-attendance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <span>ATTENDANCE</span>
            <span>→</span>
            <span class="text-gray-900 font-medium">Detailed Summary</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">October 2023 Summary</h1>
          <p class="text-gray-600 mt-1">Viewing records for Ethan Williams (Grade 8-B)</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </button>
          <button class="btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Log Absence
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">October 2023</h3>
            <div class="flex items-center space-x-4">
              <button class="text-gray-600 hover:text-gray-900">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button class="text-gray-600 hover:text-gray-900">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center space-x-4 mb-4 text-sm">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-success-500 rounded-full"></div>
              <span class="text-gray-600">Present</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-warning-500 rounded-full"></div>
              <span class="text-gray-600">Late</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-danger-500 rounded-full"></div>
              <span class="text-gray-600">Absent</span>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-2">
            <div class="text-center text-xs font-medium text-gray-600 py-2">MON</div>
            <div class="text-center text-xs font-medium text-gray-600 py-2">TUE</div>
            <div class="text-center text-xs font-medium text-gray-600 py-2">WED</div>
            <div class="text-center text-xs font-medium text-gray-600 py-2">THU</div>
            <div class="text-center text-xs font-medium text-gray-600 py-2">FRI</div>
            <div class="text-center text-xs font-medium text-gray-600 py-2">SAT</div>
            <div class="text-center text-xs font-medium text-gray-600 py-2">SUN</div>

            @for (day of calendarDays(); track day) {
              <div class="aspect-square flex items-center justify-center text-sm font-medium rounded-lg relative"
                   [class.text-gray-400]="!day"
                   [class.text-gray-900]="day && !day.status"
                   [class.bg-gray-50]="day && !day.status">
                @if (day) {
                  <span>{{ day.date.split('-')[2] }}</span>
                  @if (day.status) {
                    <div class="absolute bottom-1 w-2 h-2 rounded-full"
                         [class.bg-success-500]="day.status === 'present'"
                         [class.bg-warning-500]="day.status === 'late'"
                         [class.bg-danger-500]="day.status === 'absent'">
                    </div>
                  }
                }
              </div>
            }
          </div>
        </div>

        <div class="space-y-6">
          <div class="card bg-primary-600 text-white">
            <h3 class="text-sm text-white/80 uppercase mb-2">Term 1 Attendance</h3>
            <p class="text-sm text-white/90 mb-2">Overall Rate</p>
            <p class="text-5xl font-bold mb-3">94.2%</p>
            <div class="w-full bg-white/20 rounded-full h-2">
              <div class="bg-white h-2 rounded-full" style="width: 94.2%"></div>
            </div>
            <p class="text-xs text-white/80 mt-3">Keep it up! Ethan is above the school average of 91.5%.</p>
          </div>

          <div class="card">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-600 uppercase mb-1">PRESENT</p>
                <p class="text-3xl font-bold text-success-600">18</p>
                <p class="text-xs text-gray-600 mt-1">+2 From Sept</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 uppercase mb-1">ABSENT</p>
                <p class="text-3xl font-bold text-danger-600">2</p>
                <p class="text-xs text-gray-600 mt-1">1 from Sept</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 uppercase mb-1">LATE</p>
                <p class="text-3xl font-bold text-warning-600">1</p>
                <p class="text-xs text-gray-600 mt-1">On Target</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 uppercase mb-1">EXCUSED</p>
                <p class="text-3xl font-bold text-gray-900">1</p>
                <p class="text-xs text-gray-600 mt-1">Medical</p>
              </div>
            </div>
          </div>

          <div class="card bg-blue-50 border-l-4 border-primary-600">
            <div class="flex items-start space-x-2">
              <svg class="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-medium text-gray-900">Requirement Reminder</p>
                <p class="text-xs text-gray-700 mt-1">Students require 95% attendance to be eligible for the end-of-term awards and sports competitions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
        <div class="flex items-center justify-end mb-4">
          <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">All Types ▼</button>
        </div>
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Reason / Note</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Document</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Oct 10, 2023</p>
                <p class="text-xs text-gray-600">Tuesday</p>
              </td>
              <td class="px-4 py-4"><span class="badge badge-danger">ABSENT</span></td>
              <td class="px-4 py-4"><span class="text-sm text-gray-900">Medical</span></td>
              <td class="px-4 py-4"><p class="text-sm italic text-gray-600">"Fever and severe cough. Physician recommended 24hr rest."</p></td>
              <td class="px-4 py-4">
                <a href="#" class="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Dr_Note_Oct10.pdf</span>
                </a>
              </td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Oct 05, 2023</p>
                <p class="text-xs text-gray-600">Thursday</p>
              </td>
              <td class="px-4 py-4"><span class="badge badge-warning">LATE</span></td>
              <td class="px-4 py-4"><span class="text-sm text-gray-900">Transport</span></td>
              <td class="px-4 py-4"><p class="text-sm italic text-gray-600">Bus delays due to road construction on Main St.</p></td>
              <td class="px-4 py-4"><span class="text-sm text-gray-400">—</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-gray-900">Oct 01, 2023</p>
                <p class="text-xs text-gray-600">Sunday</p>
              </td>
              <td class="px-4 py-4"><span class="badge badge-danger">ABSENT</span></td>
              <td class="px-4 py-4"><span class="text-sm text-gray-900">Family</span></td>
              <td class="px-4 py-4"><p class="text-sm italic text-gray-600">Pre-approved family bereavement leave.</p></td>
              <td class="px-4 py-4">
                <a href="#" class="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Request_#821</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex items-center justify-center mt-4">
          <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View Full Attendance Archive →
          </button>
        </div>
      </div>
    </div>
  `
})
export class ParentAttendanceComponent implements OnInit {
  private parentService = inject(ParentService);
  
  calendarDays = signal<(AttendanceDay | null)[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const days: (AttendanceDay | null)[] = [];
    
    // Add empty days for offset
    for (let i = 0; i < 6; i++) {
      days.push(null);
    }
    
    // Add October days with mock attendance
    const mockStatuses = ['present', 'present', 'present', 'present', 'present', null, null, 'present', 'present', 'absent', 'present', 'present', null, null];
    
    for (let i = 1; i <= 31; i++) {
      const status = i < mockStatuses.length ? mockStatuses[i - 1] : 'present';
      days.push({
        date: `2023-10-${i.toString().padStart(2, '0')}`,
        day_of_week: '',
        status: status as any
      });
    }
    
    this.calendarDays.set(days);
  }
}
