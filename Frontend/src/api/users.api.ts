import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserAdmin,
} from "@/types/users.types";

export const usersApi = {
  getAll: async (): Promise<UserAdmin[]> => {
    const response = await axiosClient.get<ApiResponse<UserAdmin[]>>("/users");
    return response.data.data ?? [];
  },

  create: async (payload: CreateUserPayload): Promise<UserAdmin> => {
    const response = await axiosClient.post<ApiResponse<UserAdmin>>("/users", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create user.");
    }
    return response.data.data;
  },

  update: async (payload: UpdateUserPayload): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/users/${payload.id}`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update user.");
    }
  },

  remove: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete user.");
    }
  },
};