import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { CreateFinePayload, Fine, UpdateFinePayload } from "@/types/fines.types";

export const finesApi = {
  getAll: async (): Promise<Fine[]> => {
    const response = await axiosClient.get<ApiResponse<Fine[]>>("/fines");
    return response.data.data ?? [];
  },

  create: async (payload: CreateFinePayload): Promise<Fine> => {
    const response = await axiosClient.post<ApiResponse<Fine>>("/fines", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create fine.");
    }
    return response.data.data;
  },

  update: async (payload: UpdateFinePayload): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/fines/${payload.id}`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update fine.");
    }
  },

  waive: async (id: number): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/fines/${id}/waive`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to waive fine.");
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/fines/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete fine.");
    }
  },
};