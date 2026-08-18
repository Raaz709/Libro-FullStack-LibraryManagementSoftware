import { axiosClient } from "@/lib/axiosClient";
import type { Book } from "@/types/book.types";
import type { ApiResponse } from "@/types/api.types";

export const booksApi = {
  getAll: async (): Promise<Book[]> => {
    const response = await axiosClient.get<ApiResponse<Book[]>>("/books");
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch books.");
    }
    return response.data.data;
  },

  getById: async (id: number): Promise<Book> => {
    const response = await axiosClient.get<ApiResponse<Book>>(`/books/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch book.");
    }
    return response.data.data;
  },
};