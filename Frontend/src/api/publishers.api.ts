import { axiosClient } from "@/lib/axiosClient";
import type { Publisher, PublisherDto } from "@/types/book.types";

export const publishersApi = {
  // The Publishers controller returns raw bodies (not ApiResponse-wrapped).
  getAll: async (): Promise<Publisher[]> => {
    const response = await axiosClient.get<Publisher[]>("/publishers");
    return response.data;
  },

  create: async (dto: PublisherDto): Promise<Publisher> => {
    const response = await axiosClient.post<Publisher>("/publishers", dto);
    return response.data;
  },

  update: async (id: number, dto: PublisherDto): Promise<void> => {
    await axiosClient.put(`/publishers/${id}`, dto);
  },

  remove: async (id: number): Promise<void> => {
    await axiosClient.delete(`/publishers/${id}`);
  },
};