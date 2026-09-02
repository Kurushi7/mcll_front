export interface notification {
  Notification_Id: string;
  User_id: string;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string;
}

export interface UpdateNotification {
  Notification_Id: string;
  User_id?: string;
  message?: string;
  type?: string;
  is_read?: boolean;
  read_at?: string;
}
