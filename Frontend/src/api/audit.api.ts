import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { ActivityLog, AuditLog } from "@/types/audit.types";

export const auditApi = {
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const response = await axiosClient.get<ApiResponse<AuditLog[]>>("/auditlogs");
    return response.data.data ?? [];
  },

  getActivityLogs: async (): Promise<ActivityLog[]> => {
    const response = await axiosClient.get<ApiResponse<ActivityLog[]>>("/activitylogs");
    return response.data.data ?? [];
  },

  deleteAuditLog: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/auditlogs/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete audit log.");
    }
  },

  deleteActivityLog: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/activitylogs/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete activity log.");
    }
  },
};