import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, LoginResponse, AuthTokens } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  public currentUser = signal<User | null>(this.getUserFromStorage());
  public isAuthenticated = signal<boolean>(!!this.getAccessToken());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/api/auth/login/', credentials).pipe(
      tap(response => {
        this.setTokens({ access: response.access, refresh: response.refresh });
        this.setUser(response.user);
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    return this.api.post<AuthTokens>('/api/auth/token/refresh/', { refresh: refreshToken }).pipe(
      tap(tokens => {
        this.setTokens(tokens);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  private setUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }
}
