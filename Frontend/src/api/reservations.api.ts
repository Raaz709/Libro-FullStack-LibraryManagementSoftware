import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { CreateReservationPayload, Reservation } from "@/types/reservations.types";

export const reservationsApi = {
  getMy: async (): Promise<Reservation[]> => {
    const response = await axiosClient.get<ApiResponse<Reservation[]>>("/reservations/my");
    return response.data.data ?? [];
  },

  getAll: async (): Promise<Reservation[]> => {
    const response = await axiosClient.get<ApiResponse<Reservation[]>>("/reservations");
    return response.data.data ?? [];
  },

  create: async (payload: CreateReservationPayload): Promise<number> => {
    const response = await axiosClient.post<ApiResponse<number>>("/reservations", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to place reservation.");
    }
    return response.data.data;
  },

  cancel: async (reservationId: number): Promise<void> => {
    const response = await axiosClient.post<ApiResponse<null>>(`/reservations/${reservationId}/cancel`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to cancel reservation.");
    }
  },

  fulfill: async (reservationId: number): Promise<void> => {
    const response = await axiosClient.post<ApiResponse<null>>(`/reservations/${reservationId}/fulfill`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fulfill reservation.");
    }
  },
};