import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { Category, CategoryDto } from "@/types/book.types";

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await axiosClient.get<ApiResponse<Category[]>>("/categories");
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch categories.");
    }
    return response.data.data;
  },

  create: async (dto: CategoryDto): Promise<Category> => {
    const response = await axiosClient.post<ApiResponse<Category>>("/categories", dto);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create category.");
    }
    return response.data.data;
  },

  update: async (id: number, dto: CategoryDto): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/categories/${id}`, dto);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update category.");
    }
  },

  remove: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/categories/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete category.");
    }
  },
};