export interface notification {
  notification_Id?: string;
  user_id: number;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string;
}

export interface UpdateNotification {
  notification_Id?: string;
  user_id?: number;
  message?: string;
  type?: string;
  is_read?: boolean;
  read_at?: string;
}
