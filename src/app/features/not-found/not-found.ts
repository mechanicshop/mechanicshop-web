import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <main class="not-found-page">
      <section class="not-found-panel">
        <span class="eyebrow">404</span>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <a class="home-link" routerLink="/dashboard" mat-flat-button>
          <mat-icon>dashboard</mat-icon>
          Go to dashboard
        </a>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }

    .not-found-page {
      min-height: calc(100vh - 68px);
      display: grid;
      place-items: center;
      padding: var(--spacing-xl);
      background: var(--color-bg);
      color: var(--color-ink);
    }

    .not-found-panel {
      width: min(100%, 480px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      text-align: center;
    }

    .eyebrow {
      color: var(--color-primary);
      font-size: 0.875rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    h1 {
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1.1;
      font-weight: 800;
    }

    p {
      color: var(--color-muted);
      font-size: 1rem;
      line-height: 1.6;
    }

    .home-link {
      margin-top: var(--spacing-sm);
      border-radius: var(--radius-md);
      font-weight: 700;
    }
  `,
})
export class NotFound {}
