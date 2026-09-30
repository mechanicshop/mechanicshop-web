import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  template: `
    <footer class="landing-footer">
      <div class="container footer-content">
        <p>&copy; 2026 MechanicShop. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: `
    .landing-footer {
      background-color: var(--color-surface);
      border-top: 1px solid var(--color-outline-variant);
      padding-block: 1.5rem;
      margin-top: auto;
      text-align: center;
    }

    .footer-content p {
      font-size: 0.8125rem;
      color: var(--color-muted);
      margin: 0;
    }
  `,
})
export class LandingFooter {}
