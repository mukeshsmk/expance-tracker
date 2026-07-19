import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ce-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  providers: [DecimalPipe],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent implements OnChanges, OnDestroy {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() icon = 'insights';
  @Input() accent: 'navy' | 'amber' | 'success' | 'danger' = 'navy';
  @Input() prefix = '';
  @Input() suffix = '';

  displayValue: string | number = 0;
  private animationFrame: number | null = null;

  constructor(private decimalPipe: DecimalPipe) {}

  get formattedValue(): string {
    return typeof this.displayValue === 'number'
      ? this.decimalPipe.transform(this.displayValue) ?? '0'
      : this.displayValue;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['value']) return;

    if (typeof this.value !== 'number') {
      this.displayValue = this.value;
      return;
    }

    const start = changes['value'].isFirstChange() || typeof this.displayValue !== 'number' ? 0 : this.displayValue;
    this.animateTo(start, this.value);
  }

  ngOnDestroy(): void {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
  }

  private animateTo(start: number, end: number): void {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);

    const duration = 600;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayValue = Math.round(start + (end - start) * eased);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      } else {
        this.animationFrame = null;
      }
    };

    this.animationFrame = requestAnimationFrame(step);
  }
}
