import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Compose Message</h1>
          <p class="text-gray-600 mt-1">Draft your communication and broadcast across multiple channels instantly.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="card">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">RECIPIENT GROUP</label>
                <select class="input">
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>All Parents</option>
                  <option>Staff</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">TEMPLATE SELECTOR</label>
                <select class="input">
                  <option>Standard Announcement</option>
                  <option>Fee Reminder</option>
                  <option>Event Invitation</option>
                  <option>Emergency Alert</option>
                </select>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">DELIVERY CHANNELS</label>
              <div class="flex items-center space-x-4">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" checked class="rounded border-gray-300 text-primary-600" />
                  <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span class="text-sm font-medium">Email</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" class="rounded border-gray-300 text-primary-600" />
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-600">SMS</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" checked class="rounded border-gray-300 text-primary-600" />
                  <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span class="text-sm font-medium">App Push</span>
                </label>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">SUBJECT LINE</label>
              <input type="text" class="input" value="Update regarding upcoming Science Fair [Student Name]" />
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">MESSAGE BODY</label>
              <div class="border border-gray-300 rounded-lg">
                <div class="flex items-center space-x-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
                  <button class="p-1 hover:bg-gray-200 rounded">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button class="p-1 hover:bg-gray-200 rounded">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button class="p-1 hover:bg-gray-200 rounded">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  <button class="p-1 hover:bg-gray-200 rounded">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <div class="flex-1"></div>
                  <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">SMART TAGS</button>
                </div>
                <textarea class="w-full px-3 py-2 border-0 focus:ring-0 resize-none" rows="8">Dear Parents,

We are excited to share some updates regarding Alex Johnson's progress in the upcoming Science Fair prep. Your educator, [Teacher Name], has highlighted several key milestones.

Please ensure all materials are submitted by Friday.

Best regards,
School Administration</textarea>
              </div>
              <div class="flex items-center space-x-2 mt-2">
                <button class="badge badge-primary text-xs">[Student Name]</button>
                <button class="badge badge-primary text-xs">[Teacher Name]</button>
                <button class="badge badge-primary text-xs">[Date]</button>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t">
              <button class="text-sm text-gray-600 hover:text-gray-700">Discard Draft</button>
              <div class="flex items-center space-x-3">
                <button class="btn-secondary">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </button>
                <button class="btn-primary">Send Now</button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="card bg-gray-50">
            <h3 class="font-semibold text-gray-900 mb-4">LIVE PREVIEW</h3>
            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div class="flex items-center space-x-2 mb-3">
                <div class="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-900">SchoolOS</p>
                  <p class="text-xs text-gray-600">Now</p>
                </div>
              </div>
              <div class="bg-primary-600 text-white rounded-lg p-3 mb-3">
                <p class="text-sm font-medium mb-2">Science Fair Update</p>
                <p class="text-xs">Dear Parents, We are excited to share some updates regarding Alex e...</p>
              </div>
              <div class="bg-gray-100 rounded-lg p-3">
                <p class="text-xs font-medium text-gray-900 mb-2">COMMUNICATION</p>
                <p class="text-xs text-gray-700">Science Fair Preparation</p>
                <p class="text-xs text-gray-600 mt-2">Dear Parents,</p>
                <p class="text-xs text-gray-600 mt-1">We are excited to share some updates regarding Alex Johnson's progress...</p>
                <a href="#" class="text-xs text-primary-600 font-medium mt-2 inline-block">Science_Fair_Guide.pdf</a>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Reach</span>
                <span class="font-bold text-gray-900">142 Parents</span>
              </div>
              <p class="text-xs text-gray-500 mt-2">* SMS charges may apply for 12 recipients who opted out of App Push.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MessageComposerComponent {
  recipientGroup = signal('Grade 10');
}
