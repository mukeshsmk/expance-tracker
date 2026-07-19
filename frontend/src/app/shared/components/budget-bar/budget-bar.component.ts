import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ce-budget-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-bar.component.html',
  styleUrl: './budget-bar.component.scss',
})
export class BudgetBarComponent {
  private _percent = signal(0);

  @Input() set percent(val: number) {
    this._percent.set(Math.max(0, val ?? 0));
  }
  @Input() showLabel = true;

  clampedWidth = computed(() => Math.min(100, this._percent()));
  rawPercent = computed(() => this._percent());

  status = computed<'ok' | 'warning' | 'danger'>(() => {
    const p = this._percent();
    if (p >= 100) return 'danger';
    if (p >= 80) return 'warning';
    return 'ok';
  });
}
