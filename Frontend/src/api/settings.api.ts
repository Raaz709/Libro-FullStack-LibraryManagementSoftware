import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { Setting, UpdateSettingPayload } from "@/types/settings.types";

export const settingsApi = {
  getAll: async (): Promise<Setting[]> => {
    const response = await axiosClient.get<ApiResponse<Setting[]>>("/settings");
    return response.data.data ?? [];
  },

  update: async (key: string, payload: UpdateSettingPayload): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/settings/${encodeURIComponent(key)}`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to save setting.");
    }
  },

  delete: async (key: string): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/settings/${encodeURIComponent(key)}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete setting.");
    }
  },
};