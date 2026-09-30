import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Topbar } from '@Core/layout/topbar';
import { AuthService } from '@Features/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Topbar],
  template: `
    @if (authService.currentUser() && router.url !== '/' && !router.url.startsWith('/auth')) {
      <app-topbar />
    }
    <router-outlet />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class App {
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly title = signal('MechanicsShop.Client');
}
