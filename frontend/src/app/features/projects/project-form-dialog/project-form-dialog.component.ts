import { Component, Inject, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { Project } from '../../../core/models/project.model';
import { AppUser } from '../../../core/models/user.model';

@Component({
  selector: 'ce-project-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  templateUrl: './project-form-dialog.component.html',
  styleUrl: './project-form-dialog.component.scss',
})
export class ProjectFormDialogComponent implements OnInit {
  saving = signal(false);
  engineers = signal<AppUser[]>([]);
  statuses: Project['status'][] = ['Planning', 'Ongoing', 'Completed', 'On Hold'];
  private fb = inject(FormBuilder);

  form = this.fb.group({
    projectName: ['', Validators.required],
    clientName: ['', Validators.required],
    siteAddress: [''],
    assignedEngineer: [''],
    startDate: [new Date(), Validators.required],
    expectedEndDate: [new Date(), Validators.required],
    totalEstimationAmount: [0, [Validators.required, Validators.min(0)]],
    initialInvestedAmount: [0, [Validators.min(0)]],
    status: ['Planning' as Project['status'], Validators.required],
  });

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    public ref: MatDialogRef<ProjectFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project?: Project }
  ) {}

  ngOnInit(): void {
    this.userService.list().subscribe((res) => {
      this.engineers.set((res.data || []).filter((u) => u.role === 'site_engineer'));
    });

    if (this.data?.project) {
      const p = this.data.project;
      this.form.patchValue({
        projectName: p.projectName,
        clientName: p.clientName,
        siteAddress: p.siteAddress,
        assignedEngineer: typeof p.assignedEngineer === 'object' ? p.assignedEngineer?._id : (p.assignedEngineer as string) || '',
        startDate: new Date(p.startDate),
        expectedEndDate: new Date(p.expectedEndDate),
        totalEstimationAmount: p.totalEstimationAmount,
        initialInvestedAmount: p.initialInvestedAmount,
        status: p.status,
      });
    }
  }

  get isEdit(): boolean {
    return !!this.data?.project;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload: Partial<Project> = {
      ...raw,
      startDate: (raw.startDate as Date).toISOString(),
      expectedEndDate: (raw.expectedEndDate as Date).toISOString(),
      assignedEngineer: raw.assignedEngineer || undefined,
    } as Partial<Project>;

    const request$ = this.isEdit
      ? this.projectService.update(this.data.project!._id, payload)
      : this.projectService.create(payload);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.ref.close(res.data);
      },
      error: () => this.saving.set(false),
    });
  }
}
