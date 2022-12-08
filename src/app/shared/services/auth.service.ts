import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthModel } from '../models/user.model';

const BACKEND_URL = environment.apiURL + '/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token!: string;
  private isAuthenticated = false;
  authStatusSubject = new Subject<boolean>();
  private tokenTimer!: NodeJS.Timer;
  private userId!: string;

  constructor(private http: HttpClient, private router: Router) {}

  createUser(email: string, password: string) {
    const user: AuthModel = { email, password };
    this.http.post(BACKEND_URL + '/signup', user).subscribe(
      (res) => {
        console.log(res);
        this.router.navigate(['']);
      },
      (err) => {
        console.log(err);
        this.authStatusSubject.next(false);
      }
    );
  }

  loginUser(email: string, password: string) {
    const user: AuthModel = { email, password };
    this.http
      .post<{ token: string; expiresIn: number; id: string }>(
        BACKEND_URL + '/login',
        user
      )
      .subscribe(
        (res) => {
          const token = res.token;

          this.token = token;
          if (token) {
            const expiresInDuration = res.expiresIn;
            this.isAuthenticated = true;
            this.authStatusSubject.next(true);
            this.setAuthtimer(expiresInDuration);
            this.userId = res.id;
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );

            this.saveAuthData(token, expirationDate, this.userId);

            this.router.navigate(['']);
          }
        },
        (err) => {
          console.log(err);
          this.authStatusSubject.next(false);
        }
      );
  }

  logout() {
    this.token = '';
    this.isAuthenticated = false;
    this.authStatusSubject.next(false);
    this.userId = '';
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['login']);
  }

  autoAuthUser() {
    const information = this.getAuthData();
    if (!information) return this.logout();

    const now = new Date();
    const expiresIn = information?.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = information.token;
      this.isAuthenticated = true;
      this.userId = information.userId;
      this.authStatusSubject.next(true);
      this.setAuthtimer(expiresIn / 1000);
    } else {
      this.logout();
    }
  }

  getAuthListener() {
    return this.authStatusSubject.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  private setAuthtimer(expiresInDuration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expiresInDuration * 1000);
  }
  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('expiration-date', expirationDate.toISOString());
  }
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expiration-date');
  }
  private getAuthData(): {
    token: string;
    expirationDate: Date;
    userId: string;
  } | null {
    const token = localStorage.getItem('token') as string;
    const userId = localStorage.getItem('userId') as string;
    const expiration = localStorage.getItem('expiration-date') as string;

    if (token && expiration) {
      return {
        token: token,
        expirationDate: new Date(expiration),
        userId: userId,
      };
    } else {
      return null;
    }
  }
}
