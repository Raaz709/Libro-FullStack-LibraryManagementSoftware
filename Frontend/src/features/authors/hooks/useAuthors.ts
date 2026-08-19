import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authorsApi } from "@/api/authors.api";
import type { AuthorDto } from "@/types/book.types";

export function useAuthors() {
  return useQuery({
    queryKey: ["authors"],
    queryFn: authorsApi.getAll,
    retry: false,
  });
}

export function useCreateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

export function useUpdateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: AuthorDto }) =>
      authorsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

export function useDeleteAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authorsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}