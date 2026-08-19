import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { Notification } from "@/types/notifications.types";

export const notificationsApi = {
  getMy: async (): Promise<Notification[]> => {
    const response = await axiosClient.get<ApiResponse<Notification[]>>("/notifications");
    return response.data.data ?? [];
  },

  getUnread: async (): Promise<Notification[]> => {
    const response = await axiosClient.get<ApiResponse<Notification[]>>("/notifications/unread");
    return response.data.data ?? [];
  },

  markAsRead: async (id: number): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/notifications/${id}/read`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to mark notification as read.");
    }
  },

  markAllAsRead: async (): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>("/notifications/read-all");
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to mark all notifications as read.");
    }
  },
};