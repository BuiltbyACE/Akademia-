import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admissions-pipeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Admissions</h1>
          <div class="flex items-center space-x-4 mt-2">
            <button class="text-sm font-medium text-primary-600 border-b-2 border-primary-600 pb-1">Inquiry</button>
            <button class="text-sm font-medium text-gray-600 hover:text-gray-900 pb-1">Applied</button>
            <button class="text-sm font-medium text-gray-600 hover:text-gray-900 pb-1">Interviewing</button>
            <button class="text-sm font-medium text-gray-600 hover:text-gray-900 pb-1">Accepted</button>
            <button class="text-sm font-medium text-gray-600 hover:text-gray-900 pb-1">Enrolled</button>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <input type="text" placeholder="Search applicants by name or ID..." class="input w-64" />
          <select class="input">
            <option>Grade Applied</option>
            <option>Grade 9</option>
            <option>Grade 10</option>
          </select>
          <select class="input">
            <option>Academic Year 2024-25</option>
            <option>Academic Year 2025-26</option>
          </select>
          <button class="btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Applicant
          </button>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-6">
        <!-- Inquiry Column -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Inquiry</h3>
            <span class="badge badge-gray">12</span>
          </div>

          <div class="card hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-center justify-between mb-3">
              <span class="badge badge-gray text-xs">STANDARD</span>
              <button class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-medium text-sm">JM</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Julianne Moore</p>
                <p class="text-xs text-gray-600">Grade 9 • International Curric.</p>
              </div>
            </div>
            <p class="text-xs text-gray-500">Applied 2d ago</p>
          </div>

          <div class="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-danger-600">
            <div class="flex items-center justify-between mb-3">
              <span class="badge badge-danger text-xs">HIGH PRIORITY</span>
              <button class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
                <span class="text-danger-600 font-medium text-sm">AV</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Alexander Vance</p>
                <p class="text-xs text-gray-600">Grade 6 • Sports Scholarship</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <p class="text-xs text-gray-500">Applied 5h ago</p>
            </div>
          </div>
        </div>

        <!-- Applied Column -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Applied</h3>
            <span class="badge badge-gray">8</span>
          </div>

          <div class="card hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-center justify-between mb-3">
              <span class="badge badge-primary text-xs">STANDARD</span>
              <button class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-medium text-sm">ER</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Eleanor Rigby</p>
                <p class="text-xs text-gray-600">Grade 11 • Science Major</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 mb-2">
              <svg class="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <p class="text-xs text-success-600 font-medium">Documents Verified</p>
            </div>
            <p class="text-xs text-gray-500">Applied 1w ago</p>
          </div>
        </div>

        <!-- Interviewing Column -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Interviewing</h3>
            <span class="badge badge-gray">5</span>
          </div>

          <div class="card hover:shadow-lg transition-shadow cursor-pointer bg-primary-50">
            <div class="flex items-center justify-between mb-3">
              <span class="badge badge-primary text-xs">INTERVIEW SCHEDULED</span>
              <button class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span class="text-white font-medium text-sm">MA</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Marcus Aurelius</p>
                <p class="text-xs text-gray-600">Grade 12 • Philosophy & Arts</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 mb-2">
              <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              <p class="text-xs text-primary-600 font-medium">Tomorrow, 10:30 AM</p>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-white rounded-full border-2 border-primary-600"></div>
              <p class="text-xs text-gray-600">Join Meeting</p>
            </div>
          </div>
        </div>

        <!-- Accepted Column -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Accepted</h3>
            <span class="badge badge-gray">3</span>
          </div>

          <div class="card hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-center justify-between mb-3">
              <span class="badge badge-success text-xs">PENDING DECISION</span>
              <button class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                <span class="text-success-600 font-medium text-sm">SB</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Sasha Braus</p>
                <p class="text-xs text-gray-600">Grade 10 • Merit Scholarship</p>
              </div>
            </div>
            <p class="text-xs text-gray-500">Letter sent 3d ago</p>
          </div>
        </div>
      </div>

      <div class="card bg-primary-50">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Active Pipeline</h3>
            <p class="text-sm text-gray-600">142 of 200 slots filled</p>
          </div>
          <div class="w-64">
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-primary-600 h-3 rounded-full" style="width: 71%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdmissionsPipelineComponent {}
