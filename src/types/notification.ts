export interface Notification {
  notification_id?: number;
  user_id: number;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string;
}

export interface UpdateNotification {
  user_id?: number;
  message?: string;
  type?: string;
  is_read?: boolean;
  read_at?: string;
}
