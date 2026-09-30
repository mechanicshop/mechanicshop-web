import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from './auth.service';
import { DemoCredentials } from './demo-credentials';

interface LoginFormGroup {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    DemoCredentials,
    MatProgressSpinner,
    RouterLink,
  ],
  template: `
    <div class="login-container">
      <a class="landing-button" routerLink="/" mat-button>
        <mat-icon>arrow_back</mat-icon>
        Back to landing
      </a>

      <mat-card class="login-card">
        <mat-card-header class="login-header">
          <mat-card-title class="login-title">Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form class="login-form" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input
                [formControl]="emailControl"
                matInput
                type="email"
                placeholder="Enter your email"
                required
              />
              @if (emailControl.hasError('required') && emailControl.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (emailControl.hasError('email') && emailControl.touched) {
                <mat-error>Please enter a valid email address</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input
                [type]="hidePassword() ? 'password' : 'text'"
                [formControl]="passwordControl"
                matInput
                placeholder="Enter your password"
                required
              />
              <button
                class="password-toggle"
                [attr.aria-label]="hidePassword() ? 'Show password' : 'Hide password'"
                (click)="hidePassword.set(!hidePassword())"
                type="button"
                mat-icon-button
                matSuffix
                tabindex="-1"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (passwordControl.hasError('required') && passwordControl.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <div class="button-container">
              <button
                class="login-button"
                [disabled]="loginForm.invalid || isLoading()"
                mat-flat-button
                color="primary"
                type="submit"
              >
                @if (!isLoading()) {
                  Sign In
                } @else {
                  <div class="spinner-container">
                    <mat-progress-spinner mode="indeterminate" diameter="20" />
                    <span>Signing in...</span>
                  </div>
                }
              </button>
            </div>
          </form>

          <div class="divider"></div>

          <app-demo-credentials />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .login-container {
      position: relative;
      height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9fafb;
    }
    .login-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background-color: #ffffff;
      box-shadow: var(--shadow-xl);
      border-radius: var(--radius-lg);
      max-width: 420px;
      width: 100%;
    }
    .login-header {
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .login-title {
      font-size: 1.875rem;
      font-weight: 700;
      text-align: center;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .login-form mat-form-field {
      width: 100%;
    }
    .login-button {
      width: 100%;
      padding-block: 0.5rem;
      font-size: 1.125rem;
    }
    .password-toggle {
      margin-right: 0.5rem;
    }
    .divider {
      height: 1px;
      background: var(--color-outline-variant);
      margin: 0.25rem 0;
    }

    .button-container {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .landing-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      color: var(--color-muted);
      font-weight: 600;
      z-index: 1;
    }

    .spinner-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-muted);
    }
  `,
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  readonly hidePassword = signal(true);
  readonly isLoading = signal(false);

  readonly loginForm: FormGroup<LoginFormGroup> = this.fb.group<LoginFormGroup>({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required]),
  });

  protected get emailControl() {
    return this.loginForm.controls.email;
  }

  protected get passwordControl() {
    return this.loginForm.controls.password;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const { email, password } = this.loginForm.getRawValue();
      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.isLoading.set(false);
          this.snackBar.open('Invalid email or password. Please try again.', 'Close', {
            duration: 4000,
          });
        },
      });
    }
  }
}
