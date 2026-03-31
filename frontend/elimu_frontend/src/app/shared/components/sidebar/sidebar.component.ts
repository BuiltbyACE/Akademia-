import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'grid', route: '/dashboard', roles: ['admin', 'teacher'] },
    { label: 'Academics', icon: 'book', route: '/academics', roles: ['admin', 'teacher'] },
    { label: 'Users', icon: 'users', route: '/users', roles: ['admin'] },
    { label: 'Finance', icon: 'dollar-sign', route: '/finance', roles: ['admin'] },
    { label: 'Reports', icon: 'file-text', route: '/reports', roles: ['admin', 'teacher'] },
    { label: 'Settings', icon: 'settings', route: '/settings', roles: ['admin'] },
  ];

  get filteredNavItems() {
    const user = this.authService.currentUser();
    if (!user) return [];
    
    return this.navItems.filter(item => 
      !item.roles || item.roles.includes(user.role)
    );
  }

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
