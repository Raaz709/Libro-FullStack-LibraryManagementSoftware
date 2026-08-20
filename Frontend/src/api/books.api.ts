import { axiosClient } from "@/lib/axiosClient";
import type {
  Author,
  Book,
  BookCopy,
  Category,
  Publisher,
} from "@/types/book.types";
import type { ApiResponse, PagedResult } from "@/types/api.types";

export interface BookQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  language?: string;
  categoryId?: number;
  sort?: string;
}

export const booksApi = {
  getAll: async (params: BookQueryParams = {}): Promise<PagedResult<Book>> => {
    const response = await axiosClient.get<ApiResponse<PagedResult<Book>>>("/books", {
      params,
    });
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

  getAllCategories: async (): Promise<Category[]> => {
    const response = await axiosClient.get<ApiResponse<Category[]>>("/categories");
    return response.data.data ?? [];
  },

  getByCategory: async (id: number): Promise<Book[]> => {
    const response = await axiosClient.get<ApiResponse<Book[]>>(`/bookcategories/category/${id}`);
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
