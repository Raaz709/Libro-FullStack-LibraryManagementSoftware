import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { CreatePaymentPayload, Payment } from "@/types/payments.types";

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    const response = await axiosClient.get<ApiResponse<Payment[]>>("/payments");
    return response.data.data ?? [];
  },

  getByUser: async (userId: number): Promise<Payment[]> => {
    const response = await axiosClient.get<ApiResponse<Payment[]>>(`/payments/user/${userId}`);
    return response.data.data ?? [];
  },

  create: async (payload: CreatePaymentPayload): Promise<Payment> => {
    const response = await axiosClient.post<ApiResponse<Payment>>("/payments", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to process payment.");
    }
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/payments/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete payment record.");
    }
  },
};