import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface DemoAccount {
  role: string;
  icon: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-demo-credentials',
  standalone: true,
  imports: [MatIconModule, MatSnackBarModule],
  template: `
    <div class="demo-credentials" [class.expanded]="expanded()">
      <button class="demo-toggle" (click)="expanded.set(!expanded())" type="button">
        <span class="toggle-bar">
          <mat-icon class="toggle-icon" [class.spinning]="expanded()">handyman</mat-icon>
          <span class="toggle-text">{{ expanded() ? 'Hide' : 'Show' }} demo credentials</span>
          <mat-icon class="chevron" [class.open]="expanded()">expand_more</mat-icon>
        </span>
      </button>

      <div class="credential-panel">
        <div class="panel-inner">
          <p class="panel-hint">Use one of these pre-seeded accounts to explore the system:</p>
          <div class="account-list">
            @for (account of accounts; track account.email) {
              <div
                class="account-row"
                (click)="copyCredentials(account, $event)"
                (keydown.enter)="copyCredentials(account, $event)"
                (keydown.space)="copyCredentials(account, $event)"
                tabindex="0"
              >
                <span class="role-badge" [class.is-manager]="account.role === 'Manager'">
                  <mat-icon class="role-icon">{{ account.icon }}</mat-icon>
                  {{ account.role }}
                </span>
                <div class="account-details">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ account.email }}</span>
                  <span class="detail-label">Password</span>
                  <span class="detail-value">{{ account.password }}</span>
                </div>
                <span class="copy-hint">Click to copy</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .demo-credentials {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .demo-toggle {
      width: 100%;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
    }

    .toggle-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-radius: var(--radius-md);
      background: var(--color-primary-container);
      color: var(--color-on-primary-container);
      font-size: 0.8125rem;
      font-weight: 600;
      transition: background 0.2s var(--ease-standard);
    }

    .toggle-bar:hover {
      background: #ffdbb3;
    }

    .toggle-icon {
      font-size: 1.125rem;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.5s var(--ease-spring);
    }

    .toggle-icon.spinning {
      transform: rotate(120deg);
    }

    .toggle-text {
      user-select: none;
    }

    .chevron {
      font-size: 1.125rem;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s var(--ease-standard);
    }

    .chevron.open {
      transform: rotate(180deg);
    }

    .credential-panel {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.4s var(--ease-standard);
    }

    .expanded .credential-panel {
      grid-template-rows: 1fr;
    }

    .panel-inner {
      overflow: hidden;
    }

    .panel-hint {
      font-size: 0.75rem;
      color: var(--color-muted);
      margin-top: 0.75rem;
      margin-bottom: 0.625rem;
      text-align: center;
    }

    .account-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .account-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      border: 1px solid var(--color-outline-variant);
      cursor: pointer;
      transition: all 0.2s var(--ease-standard);
      position: relative;
    }

    .account-row:hover {
      border-color: var(--color-primary);
      background: var(--color-primary-container);
    }

    .account-row:hover .copy-hint {
      opacity: 1;
      transform: translateY(0);
    }

    .role-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      background: var(--color-outline-variant);
      color: var(--color-muted);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .role-badge.is-manager {
      background: var(--color-primary-container);
      color: var(--color-on-primary-container);
    }

    .role-icon {
      font-size: 0.875rem;
      width: 14px;
      height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .account-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      flex: 1;
      min-width: 0;
    }

    .detail-label {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-muted);
    }

    .detail-value {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-ink);
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    }

    .copy-hint {
      font-size: 0.625rem;
      font-weight: 600;
      color: var(--color-primary);
      white-space: nowrap;
      opacity: 0;
      transform: translateY(4px);
      transition: all 0.2s var(--ease-standard);
      flex-shrink: 0;
    }
  `,
})
export class DemoCredentials {
  private readonly snackBar = inject(MatSnackBar);
  readonly expanded = signal(false);

  readonly accounts: DemoAccount[] = [
    {
      role: 'Manager',
      icon: 'admin_panel_settings',
      email: 'pm@localhost',
      password: 'pm@localhost',
    },
    {
      role: 'Labor',
      icon: 'build',
      email: 'john.labor@localhost',
      password: 'john.labor@localhost',
    },
    {
      role: 'Labor',
      icon: 'build',
      email: 'peter.labor@localhost',
      password: 'peter.labor@localhost',
    },
  ];

  async copyCredentials(account: DemoAccount, event?: Event): Promise<void> {
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }
    const text = `${account.email}:${account.password}`;
    try {
      await navigator.clipboard.writeText(text);
      this.snackBar.open(`Copied ${account.role} credentials`, 'Dismiss');
    } catch {
      this.snackBar.open('Failed to copy', 'Dismiss');
    }
  }
}
