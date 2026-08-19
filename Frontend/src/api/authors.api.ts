import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { Author, AuthorDto } from "@/types/book.types";

export const authorsApi = {
  getAll: async (): Promise<Author[]> => {
    const response = await axiosClient.get<ApiResponse<Author[]>>("/authors");
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch authors.");
    }
    return response.data.data;
  },

  create: async (dto: AuthorDto): Promise<Author> => {
    const response = await axiosClient.post<ApiResponse<Author>>("/authors", dto);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create author.");
    }
    return response.data.data;
  },

  update: async (id: number, dto: AuthorDto): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/authors/${id}`, dto);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update author.");
    }
  },

  remove: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/authors/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete author.");
    }
  },
};