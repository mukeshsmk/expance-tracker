import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData as ChartJsData } from 'chart.js';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ReportService } from '../../core/services/report.service';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';
import { MonthlyBreakdown, EngineerBreakdown, MonthlyReportSummary } from '../../core/models/report.model';

@Component({
  selector: 'ce-reports',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatProgressBarModule, MatTableModule, BaseChartDirective, StatCardComponent, EmptyStateComponent,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  loading = signal(true);
  year = signal(new Date().getFullYear());
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  projects = signal<Project[]>([]);
  months = signal<MonthlyBreakdown[]>([]);
  byEngineer = signal<EngineerBreakdown[]>([]);
  summary = signal<MonthlyReportSummary | null>(null);

  monthlyColumns = ['month', 'count', 'total', 'average', 'percentOfYear'];

  barChartData: ChartJsData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  constructor(private reportService: ReportService, private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.list().subscribe((res) => this.projects.set(res.data || []));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reportService.monthly({ year: this.year() }).subscribe((res) => {
      const data = res.data;
      this.months.set(data?.months || []);
      this.byEngineer.set(data?.byEngineer || []);
      this.summary.set(data?.summary || null);
      this.barChartData = {
        labels: (data?.months || []).map((d) => d.month),
        datasets: [{ data: (data?.months || []).map((d) => d.total), label: 'Expenses', backgroundColor: '#1E3355' }],
      };
      this.loading.set(false);
    });
  }

  onYearChange(): void {
    this.load();
  }

  hasExpenses(): boolean {
    return (this.summary()?.totalTransactions || 0) > 0;
  }
}
