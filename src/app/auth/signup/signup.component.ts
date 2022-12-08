import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  authStatusSubscription!: Subscription;

  constructor(private AuthService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSubscription = this.AuthService.authStatusSubject.subscribe(
      (status) => {
        this.isLoading = status;
      }
    );
  }

  onSubmitForm(form: NgForm) {
    if (form.invalid) return;
    const { email, password } = form.value;
    this.isLoading = true;
    this.AuthService.createUser(email, password);
  }

  ngOnDestroy(): void {
    this.authStatusSubscription.unsubscribe();
  }
}
