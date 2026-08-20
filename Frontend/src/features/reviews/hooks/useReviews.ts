import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/api/reviews.api";
import type { ReviewPayload } from "@/types/reviews.types";

export function useBookReviews(bookId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["reviews", bookId],
    queryFn: () => reviewsApi.getByBook(bookId),
    enabled,
    retry: false,
  });
}

export function useReviewMutations(bookId: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
  };

  const create = useMutation({
    mutationFn: (payload: ReviewPayload) => reviewsApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: number; payload: ReviewPayload }) =>
      reviewsApi.update(reviewId, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (reviewId: number) => reviewsApi.remove(reviewId),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}