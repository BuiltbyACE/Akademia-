import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentPortalService } from '../../../core/services/student-portal.service';
import { StudentDashboard } from '../../../core/models/student-portal.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Welcome back, Benjamin</h1>
          <p class="text-gray-600 mt-1">Monday, October 16th • Week 7 of Semester 1</p>
        </div>
        <div class="flex items-center space-x-3">
          <span class="flex items-center space-x-2 px-4 py-2 bg-success-50 text-success-700 rounded-lg">
            <div class="w-2 h-2 bg-success-500 rounded-full"></div>
            <span class="text-sm font-medium">Campus Open</span>
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span class="text-xs text-success-600 uppercase">+0.15 since midterm</span>
          </div>
          <h3 class="text-sm font-medium text-gray-700 mb-1">Current GPA</h3>
          <p class="text-4xl font-bold text-gray-900">3.82</p>
        </div>

        <div class="card">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-700 mb-1">Attendance</h3>
          <div class="flex items-end space-x-2">
            <p class="text-4xl font-bold text-gray-900">94%</p>
            <span class="text-sm text-gray-600 mb-2">target: 90%+</span>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-700 mb-1">Pending Tasks</h3>
          <div class="flex items-end space-x-2">
            <p class="text-4xl font-bold text-gray-900">06</p>
            <span class="text-sm text-danger-600 mb-2">2 Due today</span>
          </div>
        </div>
      </div>

      <div class="card bg-primary-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm text-white/80 uppercase mb-2">Class Progress</h3>
            <p class="text-3xl font-bold">78% Semester Completion</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-white/80">Trending</p>
            <p class="text-2xl font-bold">↗ up</p>
          </div>
        </div>
        <div class="w-full bg-white/20 rounded-full h-2 mt-4">
          <div class="bg-white h-2 rounded-full" style="width: 78%"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <a routerLink="/student-portal/timetable" class="text-sm text-primary-600 hover:text-primary-700 font-medium">Full Week →</a>
            </div>
            <div class="space-y-3">
              <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div class="text-center flex-shrink-0">
                  <p class="text-xs text-gray-600">09:00</p>
                  <p class="text-xs text-gray-600">AM</p>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-sm font-medium text-gray-900">Advanced Mathematics</p>
                    <span class="badge badge-primary text-xs">Lecture</span>
                  </div>
                  <p class="text-xs text-gray-600">Prof. Alan Turing • Room 402B</p>
                </div>
              </div>
              <div class="flex items-start space-x-4 p-4 bg-primary-50 border-l-4 border-primary-600 rounded-lg">
                <div class="text-center flex-shrink-0">
                  <p class="text-xs text-gray-600">11:15</p>
                  <p class="text-xs text-gray-600">AM</p>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center space-x-2">
                      <p class="text-sm font-medium text-gray-900">Quantum Physics II</p>
                      <span class="badge badge-success text-xs">new</span>
                    </div>
                    <span class="badge badge-warning text-xs">Practical</span>
                  </div>
                  <p class="text-xs text-gray-600">Dr. Marie Curie • Science Lab 3</p>
                </div>
              </div>
              <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div class="text-center flex-shrink-0">
                  <p class="text-xs text-gray-600">01:30</p>
                  <p class="text-xs text-gray-600">PM</p>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-sm font-medium text-gray-900">History of Civilizations</p>
                    <span class="badge badge-gray text-xs">Seminar</span>
                  </div>
                  <p class="text-xs text-gray-600">Prof. Howard Zinn • Auditorium A</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Grades</h3>
            <table class="w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Subject</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Assessment</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Grade</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr><td class="px-4 py-3 text-sm">Computational Theory</td><td class="px-4 py-3 text-sm">Midterm Examination</td><td class="px-4 py-3"><span class="badge badge-success">A+</span></td><td class="px-4 py-3 text-sm text-gray-600">Oct 12, 2023</td></tr>
                <tr><td class="px-4 py-3 text-sm">English Literature</td><td class="px-4 py-3 text-sm">Shakespeare Essay</td><td class="px-4 py-3"><span class="badge badge-primary">B</span></td><td class="px-4 py-3 text-sm text-gray-600">Oct 08, 2023</td></tr>
                <tr><td class="px-4 py-3 text-sm">Linear Algebra</td><td class="px-4 py-3 text-sm">Weekly Quiz #5</td><td class="px-4 py-3"><span class="badge badge-success">A-</span></td><td class="px-4 py-3 text-sm text-gray-600">Oct 05, 2023</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-6">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
            <div class="space-y-3">
              <div class="p-3 bg-danger-50 border-l-4 border-danger-600 rounded">
                <div class="flex items-center justify-between mb-1">
                  <span class="badge badge-danger text-xs">DUE IN 2 HOURS</span>
                </div>
                <p class="text-sm font-medium text-gray-900">Vector Calculus Problem Set</p>
                <p class="text-xs text-gray-600 mt-1">Oct 16, 11:59 PM</p>
              </div>
              <div class="p-3 bg-warning-50 border-l-4 border-warning-600 rounded">
                <div class="flex items-center justify-between mb-1">
                  <span class="badge badge-warning text-xs">DUE TOMORROW</span>
                </div>
                <p class="text-sm font-medium text-gray-900">Macroeconomics Final Case Study</p>
                <p class="text-xs text-gray-600 mt-1">Oct 17, 10:00 AM</p>
              </div>
              <div class="p-3 bg-gray-50 rounded">
                <div class="flex items-center justify-between mb-1">
                  <span class="badge badge-gray text-xs">IN 3 DAYS</span>
                </div>
                <p class="text-sm font-medium text-gray-900">Psychology Lab Report</p>
                <p class="text-xs text-gray-600 mt-1">Oct 19, 05:00 PM</p>
              </div>
            </div>
            <button class="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium py-2 border border-primary-200 rounded-lg hover:bg-primary-50">
              View All Assignments
            </button>
          </div>

          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Announcements</h3>
              <button class="text-primary-600 hover:text-primary-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div class="space-y-3">
              <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl">🔧</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">Campus Maintenance</p>
                  <p class="text-xs text-gray-600 mt-1">Central Library will be closed for electrical work this Saturday from 8 AM to 4 PM.</p>
                  <p class="text-xs text-gray-500 mt-1">Published 4 hours ago</p>
                </div>
              </div>
              <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl">🏀</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">Varsity Tryouts</p>
                  <p class="text-xs text-gray-600 mt-1">Basketball and Volleyball varsity tryouts start next week. Sign up at the Student Hub.</p>
                  <p class="text-xs text-gray-500 mt-1">Published Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentDashboardComponent implements OnInit {
  private studentPortalService = inject(StudentPortalService);
  
  loading = signal(false);

  ngOnInit() {
    // Load dashboard data
  }
}
