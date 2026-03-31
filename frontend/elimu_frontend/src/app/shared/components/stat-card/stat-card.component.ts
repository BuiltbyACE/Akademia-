import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css'
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() change?: number;
  @Input() icon?: string;
  @Input() iconBg?: string = 'bg-primary-100';
  @Input() iconColor?: string = 'text-primary-600';
  @Input() trend?: 'up' | 'down';
  @Input() badge?: string;

  get changeClass(): string {
    if (!this.change) return '';
    return this.change > 0 ? 'text-success-600' : 'text-danger-600';
  }

  get changeIcon(): string {
    if (!this.change) return '';
    return this.change > 0 ? 'up' : 'down';
  }
}
