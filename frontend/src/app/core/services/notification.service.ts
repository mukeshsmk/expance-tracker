import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  list(): Observable<ApiResponse<AppNotification[]>> {
    return this.http.get<ApiResponse<AppNotification[]>>(this.base);
  }

  markRead(id: string): Observable<ApiResponse<AppNotification>> {
    return this.http.put<ApiResponse<AppNotification>>(`${this.base}/${id}/read`, {});
  }
}
