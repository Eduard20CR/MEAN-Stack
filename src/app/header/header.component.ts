import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: '[app-header]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  authStatusSubscription!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.getIsAuth();
    this.authStatusSubscription = this.authService
      .getAuthListener()
      .subscribe((status) => {
        this.isLoggedIn = status;
      });
  }

  ngOnDestroy(): void {
    this.authStatusSubscription.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
