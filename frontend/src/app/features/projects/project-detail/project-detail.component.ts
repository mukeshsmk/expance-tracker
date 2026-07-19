import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BudgetBarComponent } from '../../../shared/components/budget-bar/budget-bar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExpenseFormDialogComponent } from '../../expenses/expense-form-dialog/expense-form-dialog.component';
import { ProjectFormDialogComponent } from '../project-form-dialog/project-form-dialog.component';

import { ProjectService } from '../../../core/services/project.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { ReportService } from '../../../core/services/report.service';
import { Project } from '../../../core/models/project.model';
import { Expense } from '../../../core/models/expense.model';

@Component({
  selector: 'ce-project-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatSelectModule, MatProgressBarModule,
    MatTooltipModule, BudgetBarComponent, EmptyStateComponent,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  loading = signal(true);
  project = signal<Project | null>(null);
  expenses = signal<Expense[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = signal(10);

  displayedColumns = ['date', 'createdBy', 'description', 'amount', 'actions'];

  runningTotal = computed(() => this.expenses().reduce((sum, e) => sum + e.amount, 0));

  private projectId = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private expenseService: ExpenseService,
    private reportService: ReportService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.loadProject();
    this.loadExpenses();
  }

  loadProject(): void {
    this.projectService.getById(this.projectId).subscribe({
      next: (res) => {
        this.project.set(res.data || null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadExpenses(): void {
    this.expenseService
      .listByProject(this.projectId, { page: this.page(), limit: this.pageSize() })
      .subscribe((res) => {
        this.expenses.set(res.data || []);
        this.total.set(res.meta?.total || (res.data || []).length);
      });
  }

  onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadExpenses();
  }

  openAddExpense(): void {
    const ref = this.dialog.open(ExpenseFormDialogComponent, { data: { projectId: this.projectId }, width: '600px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Expense added successfully', 'Dismiss', { duration: 3000 });
        this.loadProject();
        this.loadExpenses();
      }
    });
  }

  editExpense(expense: Expense): void {
    const ref = this.dialog.open(ExpenseFormDialogComponent, {
      data: { projectId: this.projectId, expense },
      width: '600px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Expense updated', 'Dismiss', { duration: 3000 });
        this.loadProject();
        this.loadExpenses();
      }
    });
  }

  deleteExpense(expense: Expense): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete expense?',
        message: `Remove this expense of ₹${expense.amount}?`,
        confirmLabel: 'Delete',
        danger: true,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.expenseService.delete(expense._id).subscribe(() => {
        this.snackBar.open('Expense deleted', 'Dismiss', { duration: 3000 });
        this.loadProject();
        this.loadExpenses();
      });
    });
  }

  editProject(): void {
    const ref = this.dialog.open(ProjectFormDialogComponent, { data: { project: this.project() }, width: '600px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Project updated', 'Dismiss', { duration: 3000 });
        this.loadProject();
      }
    });
  }

  exportExcel(): void {
    this.reportService.downloadExcel(this.projectId).subscribe((blob) => {
      this.triggerDownload(blob, `${this.project()?.projectName || 'project'}-expenses.xlsx`);
    });
  }

  exportPdf(): void {
    this.reportService.downloadPdf(this.projectId).subscribe((blob) => {
      this.triggerDownload(blob, `${this.project()?.projectName || 'project'}-report.pdf`);
    });
  }

  billUrl(expense: Expense): string {
    return expense.billFile?.url || '';
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  engineerName(): string {
    const eng = this.project()?.assignedEngineer;
    return eng && typeof eng === 'object' ? eng.name : 'Unassigned';
  }
}
