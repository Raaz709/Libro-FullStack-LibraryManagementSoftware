import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { BookCopy, BookCopyPayload } from "@/types/book.types";

export const bookCopiesApi = {
  getAll: async (): Promise<BookCopy[]> => {
    const response = await axiosClient.get<ApiResponse<BookCopy[]>>("/bookcopies");
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch book copies.");
    }
    return response.data.data;
  },

  create: async (payload: BookCopyPayload): Promise<BookCopy> => {
    const response = await axiosClient.post<ApiResponse<BookCopy>>("/bookcopies", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create book copy.");
    }
    return response.data.data;
  },

  update: async (id: number, payload: BookCopyPayload): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/bookcopies/${id}`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update book copy.");
    }
  },

  remove: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/bookcopies/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete book copy.");
    }
  },
};