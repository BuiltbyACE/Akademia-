import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-performance-analytics',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p class="text-gray-600 mt-1">Comprehensive academic oversight for the 2023-2024 Academic Session</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">Download CSV</button>
          <button class="btn-primary">New Exam Cycle</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card title="Avg. School GPA" value="3.64 / 4.0" [change]="4.2" icon="check" iconBg="bg-success-100" iconColor="text-success-600" />
        <app-stat-card title="Pass Rate" value="94.2%" [change]="1.8" icon="check" iconBg="bg-primary-100" iconColor="text-primary-600" />
        <app-stat-card title="At Risk Students" value="48" [change]="-12" badge="Total" icon="alert" iconBg="bg-danger-100" iconColor="text-danger-600" />
        <app-stat-card title="Subject Completion" value="89%" badge="Stable" icon="check" iconBg="bg-gray-100" iconColor="text-gray-600" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">Pass Rate by Grade Level</h3>
            <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">Pass rate chart placeholder</p>
            </div>
          </div>

          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">GPA Performance Trends</h3>
            <p class="text-sm text-gray-600 mb-4">Last 5 Terms comparison</p>
            <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">GPA trends chart placeholder</p>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">Subject Mastery</h3>
            <div class="h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <p class="text-gray-500">Radar chart</p>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm"><span>Mathematics</span><span class="font-medium">88%</span></div>
              <div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-primary-600 h-2 rounded-full" style="width: 88%"></div></div>
              <div class="flex items-center justify-between text-sm"><span>Literature</span><span class="font-medium">94%</span></div>
              <div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-primary-600 h-2 rounded-full" style="width: 94%"></div></div>
            </div>
          </div>

          <div class="card bg-danger-50 border border-danger-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-danger-900">Intervention Required</h3>
              <span class="badge badge-danger">PRIORITY HIGH</span>
            </div>
            <div class="space-y-3">
              <div class="flex items-center space-x-3 p-3 bg-white rounded-lg">
                <div class="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-danger-600 font-medium text-sm">MT</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">Marcus Thorne</p>
                  <p class="text-xs text-gray-600">Grade 11 • GPA: 1.8</p>
                  <p class="text-xs text-danger-600 font-medium">3 Failed Subs</p>
                </div>
                <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">Draft Letter</button>
              </div>
              <div class="flex items-center space-x-3 p-3 bg-white rounded-lg">
                <div class="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-warning-600 font-medium text-sm">EV</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">Elara Vance</p>
                  <p class="text-xs text-gray-600">Grade 10 • GPA: 2.1</p>
                  <p class="text-xs text-warning-600 font-medium">2 Failed Subs</p>
                </div>
                <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">Draft Letter</button>
              </div>
              <button class="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2">View All 48 Students</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PerformanceAnalyticsComponent {}
