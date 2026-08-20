import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/api/reservations.api";
import type { CreateReservationPayload } from "@/types/reservations.types";

export function useMyReservations() {
  return useQuery({
    queryKey: ["reservations", "my"],
    queryFn: reservationsApi.getMy,
    retry: false,
  });
}

export function useAllReservations() {
  return useQuery({
    queryKey: ["reservations", "all"],
    queryFn: reservationsApi.getAll,
    retry: false,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReservationPayload) => reservationsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", "my"] });
      queryClient.invalidateQueries({ queryKey: ["reservations", "all"] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: number) => reservationsApi.cancel(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", "my"] });
      queryClient.invalidateQueries({ queryKey: ["reservations", "all"] });
    },
  });
}

export function useFulfillReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: number) => reservationsApi.fulfill(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", "all"] });
    },
  });
}