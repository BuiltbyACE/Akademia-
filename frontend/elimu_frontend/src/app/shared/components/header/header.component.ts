import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUser;
  showUserMenu = signal(false);
  showNotifications = signal(false);

  notifications = signal([
    { id: '1', title: 'New admission', message: 'Marcus J. (Grade 8)', time: '12m ago', unread: true },
    { id: '2', title: 'Fee Payment', message: 'Sarah Williams - Invoice #SCH-28422', time: '1h ago', unread: true },
    { id: '3', title: 'Late Arrival', message: 'Grade 10-B - 5 students marked late', time: '2h ago', unread: false },
  ]);

  get unreadCount() {
    return this.notifications().filter(n => n.unread).length;
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
