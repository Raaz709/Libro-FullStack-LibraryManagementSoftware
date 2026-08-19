import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type {
  BorrowItem,
  BorrowTransaction,
  CreateItemPayload,
  CreateTransactionPayload,
} from "@/types/borrow.types";

export const borrowingApi = {
  getTransactions: async (): Promise<BorrowTransaction[]> => {
    const response = await axiosClient.get<ApiResponse<BorrowTransaction[]>>("/borrowtransactions");
    return response.data.data ?? [];
  },

  getItems: async (): Promise<BorrowItem[]> => {
    const response = await axiosClient.get<ApiResponse<BorrowItem[]>>("/borrowitems");
    return response.data.data ?? [];
  },

  getOverdueItems: async (): Promise<BorrowItem[]> => {
    const response = await axiosClient.get<ApiResponse<BorrowItem[]>>("/borrowitems/overdue");
    return response.data.data ?? [];
  },

  createTransaction: async (payload: CreateTransactionPayload): Promise<BorrowTransaction> => {
    const response = await axiosClient.post<ApiResponse<BorrowTransaction>>(
      "/borrowtransactions",
      payload,
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create borrow transaction.");
    }
    return response.data.data;
  },

  createItem: async (payload: CreateItemPayload): Promise<BorrowItem> => {
    const response = await axiosClient.post<ApiResponse<BorrowItem>>("/borrowitems", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create borrow item.");
    }
    return response.data.data;
  },

  renewItem: async (id: number, newDueDate: string): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(
      `/borrowitems/${id}/renew`,
      JSON.stringify(newDueDate),
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to renew borrow item.");
    }
  },

  returnItem: async (id: number, conditionAtReturn?: string | null): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(
      `/borrowitems/${id}/return`,
      JSON.stringify(conditionAtReturn ?? null),
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to return borrow item.");
    }
  },
};