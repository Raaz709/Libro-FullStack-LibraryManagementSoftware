import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type {
  CreatePermissionPayload,
  Permission,
  RoleInfo,
  RolePermissionPayload,
} from "@/types/permissions.types";

export const permissionsApi = {
  getAll: async (): Promise<Permission[]> => {
    const response = await axiosClient.get<ApiResponse<Permission[]>>("/permissions");
    return response.data.data ?? [];
  },

  getRoles: async (): Promise<RoleInfo[]> => {
    const response = await axiosClient.get<ApiResponse<RoleInfo[]>>("/permissions/roles");
    return response.data.data ?? [];
  },

  create: async (payload: CreatePermissionPayload): Promise<number> => {
    const response = await axiosClient.post<ApiResponse<number>>("/permissions", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create permission.");
    }
    return response.data.data;
  },

  update: async (permissionId: number, payload: CreatePermissionPayload): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/permissions/${permissionId}`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update permission.");
    }
  },

  delete: async (permissionId: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/permissions/${permissionId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete permission.");
    }
  },

  assign: async (payload: RolePermissionPayload): Promise<void> => {
    const response = await axiosClient.post<ApiResponse<null>>("/permissions/assign", payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to assign permission.");
    }
  },

  revoke: async (payload: RolePermissionPayload): Promise<void> => {
    const response = await axiosClient.post<ApiResponse<null>>("/permissions/revoke", payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to revoke permission.");
    }
  },
};