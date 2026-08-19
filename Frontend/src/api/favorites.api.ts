import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { Book } from "@/types/book.types";

export const favoritesApi = {
  getMyFavorites: async (): Promise<Book[]> => {
    const response = await axiosClient.get<ApiResponse<Book[]>>("/favorites");
    return response.data.data ?? [];
  },

  isFavorite: async (bookId: number): Promise<boolean> => {
    const response = await axiosClient.get<ApiResponse<boolean>>(`/favorites/book/${bookId}`);
    return response.data.data ?? false;
  },

  add: async (bookId: number): Promise<void> => {
    const response = await axiosClient.post<ApiResponse<null>>(`/favorites/book/${bookId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add to favorites.");
    }
  },

  remove: async (bookId: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/favorites/book/${bookId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to remove from favorites.");
    }
  },
};