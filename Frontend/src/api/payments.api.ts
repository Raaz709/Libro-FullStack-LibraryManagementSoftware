import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { Payment } from "@/types/payments.types";

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    const response = await axiosClient.get<ApiResponse<Payment[]>>("/payments");
    return response.data.data ?? [];
  },

  delete: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/payments/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete payment record.");
    }
  },
};