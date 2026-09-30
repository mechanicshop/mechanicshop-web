import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `
    <header class="page-header">
      <ng-content select="h1"></ng-content>
      <ng-content select="p"></ng-content>
    </header>
  `,
  styles: `
    app-page-header {
      display: block;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-ink);
      margin-bottom: 0.25rem;
      margin-top: 0;
    }
    p {
      color: var(--color-muted);
      font-size: 0.875rem;
      margin: 0;
    }
  `,
})
export class PageHeader {}
