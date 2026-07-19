import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ce-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      <p>{{ subtitle }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 56px 24px;
      color: var(--ce-text-secondary);
    }
    mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--ce-border);
      margin-bottom: 12px;
    }
    h3 {
      margin: 0 0 6px;
      color: var(--ce-text-primary);
      font-size: 16px;
    }
    p {
      margin: 0 0 16px;
      font-size: 13.5px;
      max-width: 360px;
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() subtitle = '';
}
