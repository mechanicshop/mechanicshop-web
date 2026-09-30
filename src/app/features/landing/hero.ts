import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [MatButtonModule, MatIcon, RouterLink],
  template: `
    <header class="hero-section">
      <div class="container hero-content">
        <div class="hero-text-block">
          <span class="hero-badge">Professional Auto Care</span>
          <h1 class="hero-title">
            Keep Your Vehicle Running <br />
            <span class="brand-highlight">At Its Absolute Best</span>
          </h1>
          <p class="hero-subtitle">
            Manage operations, track repairs, and schedule services with our unified shop portal.
            Fast, reliable, and premium quality service guaranteed.
          </p>
          <div class="hero-actions">
            <button class="hero-cta-btn" mat-flat-button color="primary" routerLink="/auth/login">
              Get Started
              <mat-icon>arrow_forward</mat-icon>
            </button>
            <a class="hero-link-btn" href="#services">Our Services</a>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: `
    .hero-section {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      background: linear-gradient(180deg, rgba(255, 152, 0, 0.04) 0%, rgba(255, 255, 255, 0) 100%);
      padding-block: 5rem 4rem;
      border-bottom: 1px solid var(--color-outline-variant);
    }

    .hero-content {
      display: flex;
      justify-content: center;
      text-align: center;
    }

    .hero-text-block {
      max-width: 800px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .hero-badge {
      display: inline-block;
      padding: 0.35rem 1rem;
      background-color: rgba(255, 152, 0, 0.08);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .hero-title {
      font-size: 2.75rem;
      font-weight: 800;
      line-height: 1.15;
      color: var(--color-ink);
      letter-spacing: -0.02em;
    }

    .brand-highlight {
      color: var(--color-primary);
      background: linear-gradient(120deg, var(--color-primary) 0%, rgba(255, 152, 0, 0.8) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: var(--color-muted);
      line-height: 1.6;
      max-width: 600px;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-top: 0.5rem;
    }

    .hero-cta-btn {
      height: 48px;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 600;
      padding-inline: 1.5rem;
    }

    .hero-link-btn {
      color: var(--color-ink);
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s ease;
      font-size: 0.95rem;

      &:hover {
        color: var(--color-primary);
      }
    }
  `,
})
export class LandingHero {}
