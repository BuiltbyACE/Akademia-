import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Report Card Preview</h1>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">✏️ Edit Grades</button>
          <button class="btn-primary">🖨️ Print PDF</button>
        </div>
      </div>

      <div class="card max-w-4xl mx-auto">
        <div class="flex items-start justify-between mb-6 pb-6 border-b">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-2xl">🎓</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Scholar Slate International</h2>
              <p class="text-sm text-gray-600">OFFICIAL ACADEMIC RECORD</p>
            </div>
          </div>
          <div class="text-right">
            <span class="badge badge-primary">FALL SEMESTER 2024</span>
            <p class="text-sm text-gray-600 mt-2">Issued: December 15, 2024</p>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4 mb-6 pb-6 border-b">
          <div><p class="text-xs text-gray-600 uppercase mb-1">Student Name</p><p class="text-sm font-medium">Julian Alexander Vance</p></div>
          <div><p class="text-xs text-gray-600 uppercase mb-1">Student ID</p><p class="text-sm font-medium">SS-2024-0892</p></div>
          <div><p class="text-xs text-gray-600 uppercase mb-1">Grade / Class</p><p class="text-sm font-medium">11th Grade - Section B</p></div>
          <div><p class="text-xs text-gray-600 uppercase mb-1">Faculty Advisor</p><p class="text-sm font-medium">Dr. Elena Rodriguez</p></div>
        </div>

        <h3 class="font-semibold text-gray-900 mb-4">📚 Subject Performance</h3>
        <table class="w-full mb-6">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Subject</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Score</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Grade</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Remark</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr><td class="px-4 py-3 text-sm">Advanced Mathematics</td><td class="px-4 py-3 text-center font-medium">94/100</td><td class="px-4 py-3 text-center"><span class="badge badge-success">A+</span></td><td class="px-4 py-3 text-sm italic text-gray-600">Exceptional problem solving skills.</td></tr>
            <tr><td class="px-4 py-3 text-sm">Theoretical Physics</td><td class="px-4 py-3 text-center font-medium">88/100</td><td class="px-4 py-3 text-center"><span class="badge badge-success">A</span></td><td class="px-4 py-3 text-sm italic text-gray-600">Strong conceptual understanding.</td></tr>
            <tr><td class="px-4 py-3 text-sm">World Literature</td><td class="px-4 py-3 text-center font-medium">91/100</td><td class="px-4 py-3 text-center"><span class="badge badge-success">A+</span></td><td class="px-4 py-3 text-sm italic text-gray-600">Deep analytical essays.</td></tr>
            <tr><td class="px-4 py-3 text-sm">Computer Science II</td><td class="px-4 py-3 text-center font-medium">98/100</td><td class="px-4 py-3 text-center"><span class="badge badge-success">A+</span></td><td class="px-4 py-3 text-sm italic text-gray-600">Outstanding project execution.</td></tr>
            <tr><td class="px-4 py-3 text-sm">Macroeconomics</td><td class="px-4 py-3 text-center font-medium">82/100</td><td class="px-4 py-3 text-center"><span class="badge badge-primary">B+</span></td><td class="px-4 py-3 text-sm italic text-gray-600">Good grasp of market dynamics.</td></tr>
          </tbody>
        </table>

        <div class="grid grid-cols-2 gap-6 mb-6">
          <div class="card bg-gray-50">
            <h4 class="text-sm font-medium text-gray-700 mb-3">GPA Trend</h4>
            <div class="h-32 flex items-end space-x-2">
              <div class="flex-1 bg-gray-300 rounded-t" style="height: 60%"></div>
              <div class="flex-1 bg-gray-300 rounded-t" style="height: 70%"></div>
              <div class="flex-1 bg-gray-300 rounded-t" style="height: 75%"></div>
              <div class="flex-1 bg-primary-600 rounded-t" style="height: 85%"></div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-gray-600">
              <span>TERM 1</span><span>TERM 2</span><span>TERM 3</span><span class="font-medium text-primary-600">CURRENT</span>
            </div>
          </div>
          <div class="card bg-primary-50">
            <h4 class="text-sm font-medium text-gray-700 mb-2">📅 Attendance</h4>
            <div class="text-center">
              <p class="text-5xl font-bold text-primary-600">98.5%</p>
              <p class="text-sm text-gray-600 mt-2">88 / 90 Days Present</p>
            </div>
          </div>
        </div>

        <div class="card bg-blue-50 border-l-4 border-primary-600 mb-6">
          <h4 class="font-semibold text-gray-900 mb-2">Teacher's Remarks</h4>
          <p class="text-sm text-gray-700 italic">"Julian continues to demonstrate academic excellence across all core subjects. His participation in the recent coding Olympiad was commendable. We encourage him to maintain his focus as he prepares for university entrance exams next year. He is a pleasure to have in class."</p>
          <p class="text-sm text-gray-600 mt-3">— Dr. Elena Rodriguez, Lead Faculty</p>
        </div>

        <div class="flex items-center justify-between pt-6 border-t">
          <div class="text-center"><div class="w-32 h-px bg-gray-400 mb-2"></div><p class="text-xs text-gray-600">PARENT/GUARDIAN SIGNATURE</p></div>
          <div class="text-center"><div class="w-32 h-px bg-gray-400 mb-2"></div><p class="text-xs text-gray-600">SCHOOL REGISTRAR</p></div>
        </div>
      </div>
    </div>
  `
})
export class ReportCardComponent {}
