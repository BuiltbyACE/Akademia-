import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grade-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Quarterly Exams: Year 10</h1>
          <div class="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span>👥 Class 10-B</span>
            <span>📅 Fall Term 2024</span>
            <span class="badge badge-warning">84% Completed</span>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">Bulk Import</button>
          <button class="btn-primary">Export to Report Card</button>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-6">
        <div class="card"><h3 class="text-sm text-gray-600 mb-1">AVERAGE SCORE</h3><div class="flex items-end space-x-2"><h2 class="text-3xl font-bold text-gray-900">78.4%</h2><span class="text-success-600 font-medium mb-1">↗+2.1%</span></div></div>
        <div class="card"><h3 class="text-sm text-gray-600 mb-1">MATHEMATICS AVG</h3><div class="flex items-end space-x-2"><h2 class="text-3xl font-bold text-gray-900">72.1%</h2><span class="text-danger-600 font-medium mb-1">↘-0.8%</span></div></div>
        <div class="card"><h3 class="text-sm text-gray-600 mb-1">SCIENCE AVG</h3><div class="flex items-end space-x-2"><h2 class="text-3xl font-bold text-gray-900">81.5%</h2><span class="text-success-600 font-medium mb-1">↗+4.3%</span></div></div>
        <div class="card"><h3 class="text-sm text-gray-600 mb-1">PENDING GRADING</h3><h2 class="text-3xl font-bold text-warning-600">12</h2><p class="text-sm text-gray-600 mt-1">Students</p></div>
      </div>

      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase sticky left-0 bg-gray-50">Student Name</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">English</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Mathematics</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Science</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">History</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Arts</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 sticky left-0 bg-white"><div class="flex items-center space-x-2"><div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><span class="text-primary-600 text-xs font-medium">AA</span></div><div><p class="text-sm font-medium">Alex Anderson</p><p class="text-xs text-gray-500">ID: #STU2401</p></div></div></td>
                <td class="px-4 py-3 text-center"><input type="number" value="88" class="w-16 px-2 py-1 border rounded text-center" /></td>
                <td class="px-4 py-3 text-center"><input type="number" value="92" class="w-16 px-2 py-1 border rounded text-center" /></td>
                <td class="px-4 py-3 text-center"><input type="number" value="85" class="w-16 px-2 py-1 border rounded text-center" /></td>
                <td class="px-4 py-3 text-center"><input type="number" value="79" class="w-16 px-2 py-1 border rounded text-center" /></td>
                <td class="px-4 py-3 text-center"><input type="number" value="95" class="w-16 px-2 py-1 border rounded text-center" /></td>
                <td class="px-4 py-3 text-center"><span class="badge badge-success">GRADED</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 sticky left-0 bg-white"><div class="flex items-center space-x-2"><div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><span class="text-primary-600 text-xs font-medium">BC</span></div><div><p class="text-sm font-medium">Bella Chen</p><p class="text-xs text-gray-500">ID: #STU2402</p></div></div></td>
                <td class="px-4 py-3 text-center"><input type="number" value="94" class="w-16 px-2 py-1 border rounded text-center" /></td>
                <td class="px-4 py-3 text-center"><input type="number" class="w-16 px-2 py-1 border rounded text-center border-dashed border-warning-500 bg-warning-50" placeholder="--" /></td>
                <td class="px-4 py-3 text-center"><input type="number" value="89" class="w-16 px-2 py-1 border rounded text-center" /></td>
                <td class="px-4 py-3 text-center"><input type="number" value="91" class="w-16 px-2 py-1 border rounded text-center" /></td>
                <td class="px-4 py-3 text-center"><input type="number" value="88" class="w-16 px-2 py-1 border rounded text-center" /></td>
                <td class="px-4 py-3 text-center"><span class="badge badge-warning">PENDING</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card bg-primary-50">
          <div class="flex items-start space-x-3">
            <div class="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xl">✨</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Grading Insights</h3>
              <p class="text-sm text-gray-700">The overall class performance is up by 2.1% compared to the previous quarter. Mathematics shows a slight dip in average, primarily due to the "Advanced Geometry" module. Recommendation: Additional review session for Unit 4.</p>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="font-semibold text-gray-900 mb-4">Class Distribution</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between"><span class="text-sm">A</span><div class="flex-1 mx-3 bg-gray-200 rounded-full h-2"><div class="bg-success-500 h-2 rounded-full" style="width: 38%"></div></div><span class="text-sm font-medium">38%</span></div>
            <div class="flex items-center justify-between"><span class="text-sm">B</span><div class="flex-1 mx-3 bg-gray-200 rounded-full h-2"><div class="bg-primary-500 h-2 rounded-full" style="width: 46%"></div></div><span class="text-sm font-medium">46%</span></div>
            <div class="flex items-center justify-between"><span class="text-sm">C</span><div class="flex-1 mx-3 bg-gray-200 rounded-full h-2"><div class="bg-warning-500 h-2 rounded-full" style="width: 12%"></div></div><span class="text-sm font-medium">12%</span></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GradeEntryComponent {}
