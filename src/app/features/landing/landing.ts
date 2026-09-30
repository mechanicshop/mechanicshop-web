import { Component } from '@angular/core';

import { LandingFooter } from './footer';
import { LandingHero } from './hero';
import { LandingNavBar } from './nav-bar';
import { LandingServices } from './services';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingNavBar, LandingHero, LandingServices, LandingFooter],
  template: `
    <div class="landing-container">
      <app-landing-nav-bar />
      <app-landing-hero />
      <app-landing-services />
      <app-landing-footer />
    </div>
  `,
  styles: `
    .landing-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg);
      color: var(--color-ink);
    }
  `,
})
export class Landing {}
