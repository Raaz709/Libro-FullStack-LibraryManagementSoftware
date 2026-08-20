export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  referenceId?: number | null;
  isRead: boolean;
  createdAt: string;
}