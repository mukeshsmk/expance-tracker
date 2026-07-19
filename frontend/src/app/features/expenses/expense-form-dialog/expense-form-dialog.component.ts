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
import { MatIconModule } from '@angular/material/icon';
import { ExpenseService } from '../../../core/services/expense.service';
import { UserService } from '../../../core/services/user.service';
import { Expense } from '../../../core/models/expense.model';
import { AppUser } from '../../../core/models/user.model';

@Component({
  selector: 'ce-expense-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatIconModule,
  ],
  templateUrl: './expense-form-dialog.component.html',
  styleUrl: './expense-form-dialog.component.scss',
})
export class ExpenseFormDialogComponent implements OnInit {
  saving = signal(false);
  selectedFile = signal<File | null>(null);
  engineers = signal<AppUser[]>([]);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    createdByName: ['', Validators.required],
    expenseDate: [new Date(), Validators.required],
    description: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
  });

  constructor(
    private expenseService: ExpenseService,
    private userService: UserService,
    public ref: MatDialogRef<ExpenseFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: string; expense?: Expense }
  ) {}

  ngOnInit(): void {
    this.userService.list().subscribe((res) => {
      this.engineers.set((res.data || []).filter((u) => u.role === 'site_engineer'));
    });

    if (this.data.expense) {
      const e = this.data.expense;
      this.form.patchValue({
        createdByName: e.createdByName,
        expenseDate: new Date(e.expenseDate),
        description: e.description,
        amount: e.amount,
      });
    }
  }

  get isEdit(): boolean {
    return !!this.data.expense;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();

    const formData = new FormData();
    formData.append('project', this.data.projectId);
    formData.append('createdByName', raw.createdByName!);
    formData.append('expenseDate', (raw.expenseDate as Date).toISOString());
    formData.append('description', raw.description!);
    formData.append('amount', String(raw.amount));
    if (this.selectedFile()) {
      formData.append('billFile', this.selectedFile()!);
    }

    if (this.isEdit) {
      this.expenseService.update(this.data.expense!._id, formData).subscribe({
        next: () => { this.saving.set(false); this.ref.close(true); },
        error: () => this.saving.set(false),
      });
    } else {
      this.expenseService.create(formData).subscribe({
        next: () => { this.saving.set(false); this.ref.close(true); },
        error: () => this.saving.set(false),
      });
    }
  }
}
