import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { publishersApi } from "@/api/publishers.api";
import type { PublisherDto } from "@/types/book.types";

export function usePublishers() {
  return useQuery({
    queryKey: ["publishers"],
    queryFn: publishersApi.getAll,
    retry: false,
  });
}

export function useCreatePublisher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
    },
  });
}

export function useUpdatePublisher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: PublisherDto }) =>
      publishersApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
    },
  });
}

export function useDeletePublisher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
    },
  });
}