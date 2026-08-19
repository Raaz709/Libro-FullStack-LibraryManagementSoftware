import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { finesApi } from "@/api/fines.api";
import type { CreateFinePayload, UpdateFinePayload } from "@/types/fines.types";

export function useFines() {
  return useQuery({
    queryKey: ["fines"],
    queryFn: finesApi.getAll,
    retry: false,
  });
}

export function useCreateFine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFinePayload) => finesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fines"] });
    },
  });
}

export function useUpdateFine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFinePayload) => finesApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fines"] });
    },
  });
}

export function useWaiveFine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => finesApi.waive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fines"] });
    },
  });
}

export function useDeleteFine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => finesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fines"] });
    },
  });
}