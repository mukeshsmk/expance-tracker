import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData as ChartJsData } from 'chart.js';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BudgetBarComponent } from '../../shared/components/budget-bar/budget-bar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary, ChartData } from '../../core/models/dashboard.model';

@Component({
  selector: 'ce-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, StatCardComponent, BudgetBarComponent, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  summary = signal<DashboardSummary | null>(null);
  charts = signal<ChartData | null>(null);

  lineChartData: ChartJsData<'line'> = { labels: [], datasets: [{ data: [], label: 'Monthly expenses', fill: true }] };
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  barChartData: ChartJsData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
    scales: { y: { beginAtZero: true } },
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.summary().subscribe((res) => this.summary.set(res.data || null));
    this.dashboardService.charts().subscribe((res) => {
      const data = res.data;
      this.charts.set(data || null);
      if (data) this.buildCharts(data);
      this.loading.set(false);
    });
  }

  private buildCharts(data: ChartData): void {
    this.lineChartData = {
      labels: data.monthlyExpenseTrend.map((m) => m.label),
      datasets: [
        {
          data: data.monthlyExpenseTrend.map((m) => m.total),
          label: 'Expenses',
          borderColor: '#DB7F2B',
          backgroundColor: 'rgba(242, 153, 74, 0.15)',
          fill: true,
          tension: 0.35,
        },
      ],
    };

    this.barChartData = {
      labels: data.budgetVsExpense.map((p) => p.projectName),
      datasets: [
        { data: data.budgetVsExpense.map((p) => p.budget), label: 'Budget', backgroundColor: '#2A4570' },
        { data: data.budgetVsExpense.map((p) => p.expenses), label: 'Expenses', backgroundColor: '#F2994A' },
      ],
    };
  }
}
