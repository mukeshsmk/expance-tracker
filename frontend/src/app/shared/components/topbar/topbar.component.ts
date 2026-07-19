import { Component, EventEmitter, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models/notification.model';

@Component({
  selector: 'ce-topbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() themeToggle = new EventEmitter<void>();

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  isDark = signal(false);

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.isDark.set(document.documentElement.getAttribute('data-theme') === 'dark');
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.list().subscribe({
      next: (res) => {
        const items = res.data || [];
        this.notifications.set(items);
        this.unreadCount.set(items.filter((n) => !n.isRead).length);
      },
      error: () => {},
    });
  }

  markRead(notification: AppNotification): void {
    if (notification.isRead) return;
    this.notificationService.markRead(notification._id).subscribe(() => this.loadNotifications());
  }

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('ce_theme', next ? 'dark' : 'light');
  }

  notificationIcon(type: string): string {
    switch (type) {
      case 'BUDGET_EXCEEDED': return 'error';
      case 'BUDGET_WARNING_80': return 'warning';
      case 'PROJECT_COMPLETED': return 'task_alt';
      case 'NEW_EXPENSE': return 'receipt_long';
      default: return 'notifications';
    }
  }
}
