import { axiosClient } from "@/lib/axiosClient";
import type {
  Author,
  Book,
  BookCopy,
  Category,
  Publisher,
} from "@/types/book.types";
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

  getAuthors: async (id: number): Promise<Author[]> => {
    const response = await axiosClient.get<ApiResponse<Author[]>>(`/books/${id}/authors`);
    return response.data.data ?? [];
  },

  getCategories: async (id: number): Promise<Category[]> => {
    const response = await axiosClient.get<ApiResponse<Category[]>>(`/bookcategories/book/${id}`);
    return response.data.data ?? [];
  },

  getPublisher: async (id: number): Promise<Publisher> => {
    const response = await axiosClient.get<Publisher>(`/publishers/${id}`);
    return response.data;
  },

  getCopies: async (id: number): Promise<BookCopy[]> => {
    const response = await axiosClient.get<ApiResponse<BookCopy[]>>(`/bookcopies/book/${id}`);
    return response.data.data ?? [];
  },
};
