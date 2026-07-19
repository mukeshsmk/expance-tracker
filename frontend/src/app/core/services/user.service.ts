import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AppUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  list(): Observable<ApiResponse<AppUser[]>> {
    return this.http.get<ApiResponse<AppUser[]>>(this.base);
  }

  create(payload: Partial<AppUser> & { password: string }): Observable<ApiResponse<AppUser>> {
    return this.http.post<ApiResponse<AppUser>>(this.base, payload);
  }

  update(id: string, payload: Partial<AppUser> & { password?: string }): Observable<ApiResponse<AppUser>> {
    return this.http.put<ApiResponse<AppUser>>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<{ id: string }>> {
    return this.http.delete<ApiResponse<{ id: string }>>(`${this.base}/${id}`);
  }
}
