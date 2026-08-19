import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { UserSummary } from "@/types/borrow.types";

export const usersApi = {
  getAll: async (): Promise<UserSummary[]> => {
    const response = await axiosClient.get<ApiResponse<UserSummary[]>>("/users");
    return response.data.data ?? [];
  },
};