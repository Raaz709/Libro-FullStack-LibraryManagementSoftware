export interface Review {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface ReviewSummary {
  averageRating: number;
  count: number;
}

export interface BookReviewsResponse {
  reviews: Review[];
  summary: ReviewSummary;
}

export interface ReviewPayload {
  bookId: number;
  rating: number;
  comment?: string | null;
}