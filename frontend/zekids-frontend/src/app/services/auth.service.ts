import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, { email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{data: AuthResponse}>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.data) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
            this.currentUserSubject.next(response.data);
          }
        })
      );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/verify-email`, { token });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    // GEÇİCİ FİX: admin@zekids.com her zaman admin
    return user?.email === 'admin@zekids.com' || user?.role === 'Admin';
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (role === 'Admin') {
      return this.isAdmin();
    }
    return user?.role === role;
  }
}
