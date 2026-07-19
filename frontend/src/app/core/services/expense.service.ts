import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Expense } from '../models/expense.model';

export interface ExpenseQuery {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private base = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  listByProject(projectId: string, query: ExpenseQuery = {}): Observable<ApiResponse<Expense[]>> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params[k] = String(v);
    });
    return this.http.get<ApiResponse<Expense[]>>(`${this.base}/project/${projectId}`, { params });
  }

  create(formData: FormData): Observable<ApiResponse<{ expense: Expense }>> {
    return this.http.post<ApiResponse<{ expense: Expense }>>(this.base, formData);
  }

  update(id: string, formData: FormData): Observable<ApiResponse<Expense>> {
    return this.http.put<ApiResponse<Expense>>(`${this.base}/${id}`, formData);
  }

  delete(id: string): Observable<ApiResponse<{ id: string }>> {
    return this.http.delete<ApiResponse<{ id: string }>>(`${this.base}/${id}`);
  }
}
