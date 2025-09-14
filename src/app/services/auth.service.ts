import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue?.token;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/signin`, credentials).pipe(
      map((response: AuthResponse) => {
        const nomeFromEmail = credentials.email.split('@')[0];
      
        const userWithToken = {
          ...response.user,
          id: response.user?.id ?? Date.now(),
          nome: nomeFromEmail,
          email: credentials.email,
          role: 'admin', 
          token: response.token
        };
      
        localStorage.setItem('currentUser', JSON.stringify(userWithToken));
        this.currentUserSubject.next(userWithToken);
      
        return {
          ...response,
          user: userWithToken
        };
      })
    );
  }
  
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData).pipe(
      map((response: AuthResponse) => {
        const nomeFromEmail = userData.email.split('@')[0];
      
        const userWithToken = {
          ...response.user,
          id: response.user?.id ?? Date.now(),
          nome: nomeFromEmail,
          email: userData.email,
          role: 'admin', 
          token: response.token
        };
      
        localStorage.setItem('currentUser', JSON.stringify(userWithToken));
        this.currentUserSubject.next(userWithToken);
      
        return {
          ...response,
          user: userWithToken
        };
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.currentUserValue?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}
