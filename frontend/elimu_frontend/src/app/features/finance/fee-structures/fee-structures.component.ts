import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fee-structures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Fee Structures</h1>
          <p class="text-gray-600 mt-1">Design and manage complex fee components for different grades</p>
        </div>
        <button class="btn-primary">+ New Structure</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 space-y-4">
          <h3 class="font-semibold text-gray-900">Active Structures</h3>
          <div class="card bg-primary-50 border-2 border-primary-600">
            <span class="badge badge-primary mb-2">ACADEMIC</span>
            <h4 class="font-semibold text-gray-900 mb-1">Grade 10 - Science</h4>
            <p class="text-sm text-gray-600 mb-3">Includes lab and field trip fees</p>
            <p class="text-2xl font-bold text-primary-600">$4,250.00</p>
            <div class="flex items-center space-x-2 mt-3 text-xs text-gray-600">
              <span>Term-based</span><span>•</span><span>4 Sections</span>
            </div>
          </div>
          <div class="card hover:bg-gray-50 cursor-pointer">
            <span class="badge badge-gray mb-2">FACILITY</span>
            <h4 class="font-semibold text-gray-900 mb-1">Boarding & Dormitory</h4>
            <p class="text-sm text-gray-600 mb-3">Full-stay boarding including meals</p>
            <p class="text-2xl font-bold text-gray-900">$1,800.00</p>
            <div class="flex items-center space-x-2 mt-3 text-xs text-gray-600">
              <span>Monthly</span><span>•</span><span>65 Students</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 card">
          <h3 class="font-semibold text-gray-900 mb-4">Structure Builder</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium text-gray-700 mb-2">STRUCTURE NAME</label><input type="text" placeholder="e.g. Grade 12 Commerce" class="input" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-2">FREQUENCY</label><select class="input"><option>Term-based</option><option>Monthly</option><option>Annual</option></select></div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">FEE COMPONENTS</label>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <input type="text" value="Tuition Fees" class="input flex-1" />
                  <input type="number" value="3500" class="input w-32" />
                  <button class="text-danger-600 hover:text-danger-700">🗑️</button>
                </div>
                <div class="flex items-center space-x-2">
                  <input type="text" value="Laboratory & Technology" class="input flex-1" />
                  <input type="number" value="450" class="input w-32" />
                  <button class="text-danger-600 hover:text-danger-700">🗑️</button>
                </div>
                <div class="flex items-center space-x-2">
                  <input type="text" value="Library Membership" class="input flex-1" />
                  <input type="number" value="200" class="input w-32" />
                  <button class="text-danger-600 hover:text-danger-700">🗑️</button>
                </div>
                <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add Row</button>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Total Structure Amount</span>
                <span class="text-2xl font-bold text-primary-600">$4,150.00</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">ASSIGNMENT & TARGETING</label>
              <div class="flex items-center space-x-4">
                <label class="flex items-center space-x-2"><input type="checkbox" checked class="rounded" /><span class="text-sm">Grade 10</span></label>
                <label class="flex items-center space-x-2"><input type="checkbox" class="rounded" /><span class="text-sm">Grade 11</span></label>
                <label class="flex items-center space-x-2"><input type="checkbox" class="rounded" /><span class="text-sm">Grade 12</span></label>
                <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Custom Group</button>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t">
              <button class="text-sm text-gray-600 hover:text-gray-700">Discard Changes</button>
              <button class="btn-primary">Save & Publish Structure</button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="card bg-primary-50"><div class="flex items-center space-x-3"><div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center"><span class="text-2xl">👥</span></div><div><p class="text-sm text-gray-600">TOTAL ASSIGNED</p><p class="text-2xl font-bold text-gray-900">1,248 Students</p></div></div></div>
        <div class="card bg-success-50"><div class="flex items-center space-x-3"><div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center"><span class="text-2xl">📊</span></div><div><p class="text-sm text-gray-600">PROJECTED REVENUE</p><p class="text-2xl font-bold text-gray-900">$2.4M / Term</p></div></div></div>
        <div class="card bg-gray-50"><div class="flex items-center space-x-3"><div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><span class="text-2xl">📅</span></div><div><p class="text-sm text-gray-600">LAST UPDATE</p><p class="text-2xl font-bold text-gray-900">Oct 24, 2024</p></div></div></div>
      </div>
    </div>
  `
})
export class FeeStructuresComponent {}
