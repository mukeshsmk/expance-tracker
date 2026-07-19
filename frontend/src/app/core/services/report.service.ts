import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { MonthlyReport } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  monthly(query: { year?: number; project?: string } = {}): Observable<ApiResponse<MonthlyReport>> {
    return this.http.get<ApiResponse<MonthlyReport>>(`${this.base}/monthly`, {
      params: query as Record<string, string>,
    });
  }

  byProject(projectId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.base}/project/${projectId}`);
  }

  downloadExcel(projectId: string): Observable<Blob> {
    return this.http.get(`${this.base}/project/${projectId}/export/excel`, { responseType: 'blob' });
  }

  downloadPdf(projectId: string): Observable<Blob> {
    return this.http.get(`${this.base}/project/${projectId}/export/pdf`, { responseType: 'blob' });
  }
}
