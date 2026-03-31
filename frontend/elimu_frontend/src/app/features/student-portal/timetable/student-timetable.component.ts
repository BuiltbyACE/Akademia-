import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-timetable',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Class Schedule</h1>
          <p class="text-gray-600 mt-1">October 16 – October 20, 2023</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">Weekly</button>
          <button class="btn-secondary">Daily</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3 card">
          <div class="grid grid-cols-5 gap-4">
            <div class="text-center">
              <p class="text-xs font-medium text-gray-600 uppercase mb-2">Mon</p>
              <p class="text-sm text-gray-900">16 Oct</p>
            </div>
            <div class="text-center">
              <p class="text-xs font-medium text-gray-600 uppercase mb-2">Tue</p>
              <p class="text-sm text-gray-900">17 Oct</p>
            </div>
            <div class="text-center">
              <p class="text-xs font-medium text-gray-600 uppercase mb-2">Wed</p>
              <p class="text-sm text-gray-900">18 Oct</p>
            </div>
            <div class="text-center">
              <p class="text-xs font-medium text-gray-600 uppercase mb-2">Thu</p>
              <p class="text-sm text-gray-900">19 Oct</p>
            </div>
            <div class="text-center">
              <p class="text-xs font-medium text-gray-600 uppercase mb-2">Fri</p>
              <p class="text-sm text-gray-900">20 Oct</p>
            </div>
          </div>

          <div class="mt-6 space-y-4">
            <div class="flex items-start space-x-4">
              <div class="w-20 text-center flex-shrink-0">
                <p class="text-sm font-medium text-gray-900">08:00 AM</p>
              </div>
              <div class="grid grid-cols-5 gap-4 flex-1">
                <div class="p-3 bg-primary-50 border-l-4 border-primary-600 rounded">
                  <p class="text-xs font-medium text-gray-900 uppercase mb-1">Mathematics</p>
                  <p class="text-xs text-gray-600">Advanced Calculus</p>
                  <p class="text-xs text-gray-500 mt-1">Prof. Ana Thomas • Room 402B</p>
                </div>
                <div></div>
                <div class="p-3 bg-primary-50 border-l-4 border-primary-600 rounded">
                  <p class="text-xs font-medium text-gray-900 uppercase mb-1">Mathematics</p>
                  <p class="text-xs text-gray-600">Advanced Calculus</p>
                  <p class="text-xs text-gray-500 mt-1">Prof. Ana Thomas • Room 402B</p>
                </div>
                <div></div>
                <div class="p-3 bg-primary-50 border-l-4 border-primary-600 rounded">
                  <p class="text-xs font-medium text-gray-900 uppercase mb-1">Mathematics</p>
                  <p class="text-xs text-gray-600">Advanced Calculus</p>
                  <p class="text-xs text-gray-500 mt-1">Prof. Ana Thomas • Room 402B</p>
                </div>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div class="w-20 text-center flex-shrink-0">
                <p class="text-sm font-medium text-gray-900">10:30 AM</p>
              </div>
              <div class="grid grid-cols-5 gap-4 flex-1">
                <div></div>
                <div class="p-3 bg-warning-50 border-l-4 border-warning-600 rounded">
                  <p class="text-xs font-medium text-gray-900 uppercase mb-1">English</p>
                  <p class="text-xs text-gray-600">Modern Literature</p>
                  <p class="text-xs text-gray-500 mt-1">Ms. Clara Oswald • Library Hall</p>
                </div>
                <div></div>
                <div class="p-3 bg-warning-50 border-l-4 border-warning-600 rounded">
                  <p class="text-xs font-medium text-gray-900 uppercase mb-1">English</p>
                  <p class="text-xs text-gray-600">Modern Literature</p>
                  <p class="text-xs text-gray-500 mt-1">Ms. Clara Oswald • Library Hall</p>
                </div>
                <div></div>
              </div>
            </div>

            <div class="text-center py-4 text-sm text-gray-600 uppercase font-medium">
              Lunch Break & Study Period
            </div>

            <div class="flex items-start space-x-4">
              <div class="w-20 text-center flex-shrink-0">
                <p class="text-sm font-medium text-gray-900">02:00 PM</p>
              </div>
              <div class="grid grid-cols-5 gap-4 flex-1">
                <div class="p-3 bg-success-50 border-l-4 border-success-600 rounded">
                  <p class="text-xs font-medium text-gray-900 uppercase mb-1">Computer Science</p>
                  <p class="text-xs text-gray-600">Algorithm Design</p>
                  <p class="text-xs text-gray-500 mt-1">Dr. Simon Pegg • CS Hub 2</p>
                </div>
                <div class="p-3 bg-danger-50 border-l-4 border-danger-600 rounded">
                  <p class="text-xs font-medium text-gray-900 uppercase mb-1">Physics</p>
                  <p class="text-xs text-gray-600">Practical Lab</p>
                  <p class="text-xs text-gray-500 mt-1">Dr. Elena Vance • Lab 12</p>
                </div>
                <div class="p-3 bg-success-50 border-l-4 border-success-600 rounded">
                  <p class="text-xs font-medium text-gray-900 uppercase mb-1">Computer Science</p>
                  <p class="text-xs text-gray-600">Algorithm Design</p>
                  <p class="text-xs text-gray-500 mt-1">Dr. Simon Pegg • CS Hub 2</p>
                </div>
                <div></div>
                <div class="p-3 bg-success-50 border-l-4 border-success-600 rounded">
                  <p class="text-xs font-medium text-gray-900 uppercase mb-1">Computer Science</p>
                  <p class="text-xs text-gray-600">Algorithm Design</p>
                  <p class="text-xs text-gray-500 mt-1">Dr. Simon Pegg • CS Hub 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">Upcoming Exams</h3>
              <span class="badge badge-danger">High Priority</span>
            </div>
            <div class="space-y-3">
              <div class="p-3 bg-danger-50 border-l-4 border-danger-600 rounded">
                <p class="text-sm font-medium text-gray-900">Physics: Midterm</p>
                <p class="text-xs text-gray-600 mt-1">Modules 1-4, Focus on Quantum Theory</p>
                <p class="text-xs text-danger-600 font-medium mt-2">In 3 Days</p>
              </div>
              <div class="p-3 bg-gray-50 rounded">
                <p class="text-sm font-medium text-gray-900">English Lit: Essay</p>
                <p class="text-xs text-gray-600 mt-1">Final draft of "Modernist Poets" analysis.</p>
                <p class="text-xs text-gray-600 font-medium mt-2">In 6 Days</p>
              </div>
            </div>
            <button class="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Exams
            </button>
          </div>

          <div class="card bg-primary-600 text-white">
            <h3 class="font-semibold mb-4">Study Plan</h3>
            <div class="space-y-2">
              <label class="flex items-center space-x-2">
                <input type="checkbox" checked class="rounded" />
                <span class="text-sm line-through opacity-75">Revise Calculus problem set (Ch. 5)</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="checkbox" class="rounded" />
                <span class="text-sm">Prep lab goggles for Friday</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="checkbox" class="rounded" />
                <span class="text-sm">Meet group for History project @ 4PM</span>
              </label>
            </div>
            <div class="mt-4 pt-4 border-t border-white/20">
              <p class="text-sm text-white/80 uppercase mb-2">Today's Goal</p>
              <p class="text-2xl font-bold">2 Hours Intensive Math Revision</p>
              <div class="w-full bg-white/20 rounded-full h-2 mt-3">
                <div class="bg-white h-2 rounded-full" style="width: 65%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentTimetableComponent {}
