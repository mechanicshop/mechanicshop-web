import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-nav-bar',
  standalone: true,
  imports: [MatButtonModule, MatIcon, MatToolbarModule, RouterLink],
  template: `
    <mat-toolbar class="landing-navbar">
      <div class="container navbar-content">
        <div class="brand-logo">
          <mat-icon class="brand-icon">handyman</mat-icon>
          <span class="logo-text">MechanicShop</span>
        </div>
        <button class="nav-login-btn" mat-flat-button color="primary" routerLink="/auth/login">
          <mat-icon>login</mat-icon>
          Dashboard Login
        </button>
      </div>
    </mat-toolbar>
  `,
  styles: `
    .landing-navbar {
      background-color: rgba(255, 255, 255, 0.8) !important;
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--color-outline-variant);
      position: sticky;
      top: 0;
      z-index: 100;
      height: 64px;
    }

    .navbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .brand-icon {
      color: var(--color-primary);
      width: 24px;
      height: 24px;
      font-size: 24px;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-ink);
      letter-spacing: -0.015em;
    }

    .nav-login-btn {
      border-radius: var(--radius-md);
      font-weight: 500;
      height: 40px;
    }
  `,
})
export class LandingNavBar {}
