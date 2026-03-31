import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { DashboardData } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  dashboardData = signal<DashboardData | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data');
        this.loading.set(false);
        console.error('Dashboard error:', err);
        
        // Use mock data for development
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const mockData: DashboardData = {
      metrics: {
        total_students: 1284,
        total_students_change: 4.2,
        total_revenue: 42500,
        total_revenue_change: 0,
        avg_attendance: 94.2,
        avg_attendance_change: 0,
        outstanding_fees: 8120,
        outstanding_fees_change: 0,
        currency: 'KES'
      },
      revenue_analytics: {
        labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
        projected: [35000, 38000, 42000, 45000, 48000, 52000],
        collected: [32000, 36000, 40000, 43000, 46000, 50000]
      },
      weekly_attendance: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        rates: [92, 94, 96, 98, 95],
        highest_day: 'Wednesday',
        highest_rate: 98
      },
      recent_activity: [
        {
          id: '1',
          type: 'admission',
          title: 'New admission: Marcus J. (Grade 8)',
          description: 'Document verification pending',
          timestamp: '12m ago',
          icon: 'user-plus'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Fee Payment: Sarah Williams',
          description: 'Invoice #SCH-28422 • $1,200',
          timestamp: '1h ago',
          icon: 'dollar'
        },
        {
          id: '3',
          type: 'attendance',
          title: 'Late Arrival: Grade 10-B',
          description: '5 students marked late by Bus Route A',
          timestamp: '2h ago',
          icon: 'clock'
        }
      ],
      alerts: [
        {
          id: '1',
          type: 'attendance',
          severity: 'high',
          title: 'Low Attendance Alert',
          message: 'Grade 12-A attendance dropped to 78% this week. Primary cause: Flu outbreak reported in dormitory.',
          created_at: '2024-05-24'
        }
      ],
      fee_defaulters_count: 12,
      pending_approvals_count: 4,
      upcoming_events: [
        {
          date: 'MAY 15',
          title: 'Founders Day',
          description: 'Grand Ceremony & Alumni Meetup at the North Wing Auditorium.'
        }
      ]
    };
    
    this.dashboardData.set(mockData);
    this.loading.set(false);
  }

  formatCurrency(value: number): string {
    const data = this.dashboardData();
    const currency = data?.metrics.currency || 'KES';
    return `${currency} ${value.toLocaleString()}`;
  }
}
