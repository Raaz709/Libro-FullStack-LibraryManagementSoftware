import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type { BookReviewsResponse, ReviewPayload } from "@/types/reviews.types";

export const reviewsApi = {
  getByBook: async (bookId: number): Promise<BookReviewsResponse> => {
    const response = await axiosClient.get<ApiResponse<BookReviewsResponse>>(`/reviews/book/${bookId}`);
    return (
      response.data.data ?? { reviews: [], summary: { averageRating: 0, count: 0 } }
    );
  },

  create: async (payload: ReviewPayload): Promise<number> => {
    const response = await axiosClient.post<ApiResponse<number>>("/reviews", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to submit review.");
    }
    return response.data.data;
  },

  update: async (reviewId: number, payload: ReviewPayload): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/reviews/${reviewId}`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update review.");
    }
  },

  remove: async (reviewId: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/reviews/${reviewId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete review.");
    }
  },
};