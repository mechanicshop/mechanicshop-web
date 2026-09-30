import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '@Features/auth/auth.service';

export interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatMenuModule, DatePipe],
  template: `
    <div class="topbar-progress"></div>
    <header class="app-header">
      <div class="topbar-container">
        <div class="topbar-left">
          <a class="logo-link" routerLink="/dashboard">
            <mat-icon class="logo-icon">dashboard</mat-icon>
            <span class="logo-text">Dashboard</span>
          </a>

          <nav class="nav-desktop">
            @for (link of navLinks; track link.path) {
              <a
                class="nav-link"
                [routerLink]="link.path"
                [routerLinkActiveOptions]="{ exact: true }"
                routerLinkActive="active"
                >{{ link.label }}</a
              >
            }
          </nav>

          <div class="nav-mobile">
            <button [matMenuTriggerFor]="navMenu" mat-icon-button aria-label="Open navigation menu">
              <mat-icon>menu</mat-icon>
            </button>
            <mat-menu #navMenu="matMenu">
              @for (link of navLinks; track link.path) {
                <a
                  [routerLink]="link.path"
                  [routerLinkActiveOptions]="{ exact: true }"
                  mat-menu-item
                  routerLinkActive="active-menu-item"
                >
                  <span>{{ link.label }}</span>
                </a>
              }
            </mat-menu>
          </div>
        </div>

        <div class="topbar-right">
          @if (displayDate(); as d) {
            <time class="topbar-date" [attr.datetime]="d | date: 'yyyy-MM-dd'">
              {{ d | date: 'longDate' }}
            </time>
          }

          <div class="topbar-actions">
            @if (currentUser(); as user) {
              <span class="user-badge">
                {{ user.email }}
              </span>
            }
            <button class="logout-btn" (click)="logout()" mat-stroked-button>
              <mat-icon class="logout-icon">logout</mat-icon>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: `
    .topbar-progress {
      height: 3px;
      background-color: var(--color-primary);
      width: 100%;
    }
    .app-header {
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      background-color: var(--color-bg);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: var(--shadow-sm);
    }
    .topbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 65px;
      padding-inline: 1.5rem;
      max-width: 1320px;
      margin-inline: auto;
      width: 100%;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--color-ink);
      font-size: 1.25rem;
      user-select: none;
    }
    .logo-icon {
      color: var(--color-primary);
      font-size: 1.5rem;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-text {
      font-weight: 800;
    }
    .nav-desktop {
      display: none;
    }
    @media (min-width: 1024px) {
      .nav-desktop {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }
    }
    .nav-mobile {
      display: flex;
      align-items: center;
    }
    @media (min-width: 1024px) {
      .nav-mobile {
        display: none;
      }
    }
    .nav-link {
      position: relative;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-muted);
      padding: 0.5rem 0.75rem;
      transition: all 0.2s var(--ease-standard);

      &:hover,
      &.active {
        color: var(--color-ink);
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        height: 2px;
        width: 0;
        transform: translateX(-50%);
        background-color: var(--color-primary);
        transition: all 0.2s var(--ease-standard);
      }

      &:hover::after,
      &.active::after {
        width: 100%;
      }
    }
    .topbar-date {
      font-size: 13px;
      color: var(--color-muted);
      font-weight: 500;
      display: none;
    }
    @media (min-width: 1024px) {
      .topbar-date {
        display: block;
      }
    }
    .user-badge {
      font-size: 0.75rem;
      color: var(--color-muted);
      font-weight: 500;
      background-color: var(--color-surface);
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-outline-variant);
      user-select: none;
      display: none;
    }
    @media (min-width: 1024px) {
      .user-badge {
        display: inline-block;
      }
    }
    .logout-btn {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-ink);
      border-color: var(--color-outline);
      display: flex;
      align-items: center;
      gap: 0.375rem;
      cursor: pointer;
    }
    .logout-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;
      width: 18px;
      height: 18px;
    }
  `,
})
export class Topbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly date = input<string | Date | undefined>(undefined);
  readonly currentUser = this.authService.currentUser;

  readonly displayDate = computed(() => this.date() || new Date());

  readonly navLinks: NavLink[] = [
    { path: '/customers', label: 'Customers' },
    { path: '/workorders', label: 'Work Orders' },
    { path: '/repairtasks', label: 'Repair Tasks' },
    { path: '/schedules', label: 'Schedules' },
  ];

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
