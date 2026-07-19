import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BudgetBarComponent } from '../../../shared/components/budget-bar/budget-bar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProjectFormDialogComponent } from '../project-form-dialog/project-form-dialog.component';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'ce-project-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatProgressBarModule, BudgetBarComponent, EmptyStateComponent,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  loading = signal(true);
  projects = signal<Project[]>([]);
  search = signal('');
  statusFilter = signal<string>('all');

  filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    return this.projects().filter((p) => {
      const matchesTerm =
        !term ||
        p.projectName.toLowerCase().includes(term) ||
        p.clientName.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || p.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.projectService.list().subscribe({
      next: (res) => {
        this.projects.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(ProjectFormDialogComponent, { data: {}, width: '600px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Project created successfully', 'Dismiss', { duration: 3000 });
        this.load();
      }
    });
  }

  openEdit(project: Project, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(ProjectFormDialogComponent, { data: { project }, width: '600px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Project updated successfully', 'Dismiss', { duration: 3000 });
        this.load();
      }
    });
  }

  confirmDelete(project: Project, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete project?',
        message: `This will permanently delete "${project.projectName}". This cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.projectService.delete(project._id).subscribe({
        next: () => {
          this.snackBar.open('Project deleted', 'Dismiss', { duration: 3000 });
          this.load();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Could not delete project', 'Dismiss', { duration: 4000 });
        },
      });
    });
  }

  openDetail(project: Project): void {
    this.router.navigate(['/projects', project._id]);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'ok';
      case 'Ongoing': return 'warning';
      case 'On Hold': return 'danger';
      default: return 'neutral';
    }
  }

  engineerName(project: Project): string {
    const eng = project.assignedEngineer;
    if (eng && typeof eng === 'object') return eng.name || 'Unassigned';
    return 'Unassigned';
  }
}
