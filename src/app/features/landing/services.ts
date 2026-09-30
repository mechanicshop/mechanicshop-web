import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

interface Service {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing-services',
  standalone: true,
  imports: [MatCardModule, MatIcon],
  template: `
    <section class="services-section container" id="services">
      <div class="section-header">
        <h2 class="section-title">Our Expert Services</h2>
        <p class="section-subtitle">
          We provide full-service mechanical care, diagnostics, and repairs for all makes and
          models.
        </p>
      </div>

      <div class="services-grid">
        @for (service of services; track service.title) {
          <mat-card class="service-card" appearance="outlined">
            <mat-card-content class="service-card-content">
              <div class="card-header-row">
                <div class="icon-container">
                  <mat-icon class="service-icon">{{ service.icon }}</mat-icon>
                </div>
                <h3 class="service-title">{{ service.title }}</h3>
              </div>
              <p class="service-desc">{{ service.description }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </section>
  `,
  styles: `
    .services-section {
      padding-block: 4rem 5rem;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-ink);
      letter-spacing: -0.015em;
      margin: 0;
    }

    .section-subtitle {
      font-size: 1rem;
      color: var(--color-muted);
      max-width: 500px;
      line-height: 1.5;
      margin: 0;
    }

    .services-grid {
      display: grid;
      gap: 1.5rem;
      width: 100%;
    }

    @media (min-width: 640px) {
      .services-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .services-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .service-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-outline-variant);
      border-top: 3px solid var(--color-primary);
      border-radius: var(--radius-md);
      padding: 1rem 0.55rem;
      transition:
        transform 0.2s var(--ease-standard),
        box-shadow 0.2s var(--ease-standard);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }
    }

    .service-card-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .card-header-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .icon-container {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-sm);
      background-color: rgba(255, 152, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .service-icon {
      color: var(--color-primary);
      font-size: 1.25rem;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .service-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .service-desc {
      font-size: 0.875rem;
      color: var(--color-muted);
      line-height: 1.5;
      margin: 0;
    }
  `,
})
export class LandingServices {
  readonly services: Service[] = [
    {
      icon: 'build',
      title: 'General Maintenance',
      description:
        'Oil changes, tire rotations, fluid checks, and more to keep your car running smoothly.',
    },
    {
      icon: 'settings',
      title: 'Brake & Tire Services',
      description:
        'Professional brake inspections, repairs, and new tire installations for your safety.',
    },
    {
      icon: 'timeline',
      title: 'Engine Diagnostics',
      description:
        'Advanced diagnostics to accurately identify and fix any engine performance issues.',
    },
    {
      icon: 'flash_on',
      title: 'Electrical System Repair',
      description: "Resolving issues with your car's wiring, lights, battery, and charging system.",
    },
    {
      icon: 'ac_unit',
      title: 'AC & Heating Repair',
      description: "Ensuring your car's climate control system works perfectly year-round.",
    },
    {
      icon: 'search',
      title: 'Pre-Purchase Inspections',
      description: 'Thorough inspections to give you peace of mind before buying a used vehicle.',
    },
  ];
}
