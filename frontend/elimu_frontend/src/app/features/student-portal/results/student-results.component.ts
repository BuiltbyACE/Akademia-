import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900">Academic Results</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <p class="text-sm text-gray-600 uppercase mb-2">Current Semester GPA</p>
          <div class="flex items-end space-x-2">
            <h2 class="text-5xl font-bold text-gray-900">3.88</h2>
            <span class="text-success-600 font-medium mb-2">+0.12</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div class="bg-primary-600 h-2 rounded-full" style="width: 97%"></div>
          </div>
          <p class="text-xs text-gray-600 mt-2">Top 5%</p>
        </div>

        <div class="card">
          <p class="text-sm text-gray-600 uppercase mb-2">Credits Earned</p>
          <div class="flex items-center space-x-2">
            <h2 class="text-5xl font-bold text-gray-900">18</h2>
            <span class="text-gray-600 text-2xl">/ 20</span>
          </div>
        </div>

        <div class="card bg-primary-600 text-white">
          <p class="text-sm text-white/80 uppercase mb-2">Official Transcript</p>
          <button class="w-full mt-4 bg-white text-primary-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-100 flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Grade Trends</h3>
          <div class="flex items-center space-x-4 text-sm">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-primary-600 rounded-full"></div>
              <span>GPA</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Avg.</span>
            </div>
          </div>
        </div>
        <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p class="text-gray-500">Grade trends chart placeholder</p>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Academic Transcript</h3>
          <p class="text-sm text-gray-600">Detailed breakdown of current academic year performance</p>
        </div>
        <div class="flex items-center justify-end space-x-3 mb-4">
          <button class="btn-secondary text-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <button class="btn-secondary text-sm">Sort By Date</button>
        </div>

        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Subject</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Assessment Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Weightage</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Grade</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span class="text-primary-600 font-bold text-sm">Σ</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">Advanced Mathematics II</span>
                </div>
              </td>
              <td class="px-4 py-4"><span class="badge badge-primary text-xs">Final Exam</span></td>
              <td class="px-4 py-4 text-sm">40%</td>
              <td class="px-4 py-4 text-sm text-gray-600">Oct 12, 2023</td>
              <td class="px-4 py-4"><span class="badge badge-success">A+</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <span class="text-success-600 font-bold text-sm">🧬</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">Molecular Biology</span>
                </div>
              </td>
              <td class="px-4 py-4"><span class="badge badge-warning text-xs">Research Project</span></td>
              <td class="px-4 py-4 text-sm">25%</td>
              <td class="px-4 py-4 text-sm text-gray-600">Sep 28, 2023</td>
              <td class="px-4 py-4"><span class="badge badge-success">A</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                    <span class="text-warning-600 font-bold text-sm">💰</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">Global Economics</span>
                </div>
              </td>
              <td class="px-4 py-4"><span class="badge badge-gray text-xs">Mid-term Quiz</span></td>
              <td class="px-4 py-4 text-sm">15%</td>
              <td class="px-4 py-4 text-sm text-gray-600">Sep 15, 2023</td>
              <td class="px-4 py-4"><span class="badge badge-primary">B+</span></td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-gray-600 font-bold text-sm">💻</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">Software Architecture</span>
                </div>
              </td>
              <td class="px-4 py-4"><span class="badge badge-primary text-xs">Project</span></td>
              <td class="px-4 py-4 text-sm">20%</td>
              <td class="px-4 py-4 text-sm text-gray-600">Sep 05, 2023</td>
              <td class="px-4 py-4"><span class="badge badge-success">A-</span></td>
            </tr>
          </tbody>
        </table>

        <div class="flex items-center justify-center mt-4">
          <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All Academic History →
          </button>
        </div>
      </div>
    </div>
  `
})
export class StudentResultsComponent {}
