import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookCopiesApi } from "@/api/bookCopies.api";
import type { BookCopyPayload } from "@/types/book.types";

export function useBookCopies() {
  return useQuery({
    queryKey: ["book-copies"],
    queryFn: bookCopiesApi.getAll,
    retry: false,
  });
}

export function useCreateBookCopy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookCopiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
}

export function useUpdateBookCopy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BookCopyPayload }) =>
      bookCopiesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
}

export function useDeleteBookCopy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookCopiesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
}