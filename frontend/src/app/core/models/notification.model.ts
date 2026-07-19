export type NotificationType =
  | 'BUDGET_WARNING_80'
  | 'BUDGET_EXCEEDED'
  | 'NEW_EXPENSE'
  | 'PROJECT_COMPLETED'
  | 'LOGIN_SUCCESS';

export interface AppNotification {
  _id: string;
  type: NotificationType;
  message: string;
  project?: string;
  isRead: boolean;
  createdAt: string;
}
