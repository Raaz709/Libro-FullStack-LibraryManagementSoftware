import { useState } from "react";
import { Star } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useBookReviews, useReviewMutations } from "@/features/reviews/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/types/reviews.types";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Stars({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (value: number) => void }) {
  return (
    <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined} aria-label={interactive ? "Rating" : `Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(value)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={interactive ? `${value} star${value === 1 ? "" : "s"}` : undefined}
        >
          <Star className={`h-4 w-4 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-line"}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewerName({ review }: { review: Review }) {
  const name = `${review.firstName ?? ""} ${review.lastName ?? ""}`.trim();
  return name || `Member #${review.userId}`;
}

export default function ReviewsSection({ bookId }: { bookId: number }) {
  const userId = useAuthStore((state) => state.user?.userId);
  const { data, isLoading, isError } = useBookReviews(bookId, Number.isInteger(bookId) && bookId > 0);
  const { create, update, remove } = useReviewMutations(bookId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const reviews = data?.reviews ?? [];
  const summary = data?.summary ?? { averageRating: 0, count: 0 };
  const myReview = reviews.find((review) => review.userId === userId) ?? null;

  const handleSubmit = () => {
    const payload = { bookId, rating, comment: comment.trim() || null };
    if (myReview) {
      update.mutate({ reviewId: myReview.id, payload });
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          setComment("");
          setRating(5);
        },
      });
    }
  };

  return (
    <Card className="mt-6 border-line bg-white shadow-[0_12px_35px_-15px_rgba(31,41,55,0.16)]">
      <CardContent className="py-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">Reviews</h2>
            <div className="mt-2 flex items-center gap-2">
              <Stars rating={Math.round(summary.averageRating)} />
              <p className="text-sm text-muted">
                {summary.count === 0
                  ? "No reviews yet"
                  : `${summary.averageRating.toFixed(1)} average from ${summary.count} review${summary.count === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-5 text-sm text-muted">Loading reviews...</p>
        ) : isError ? (
          <p className="mt-5 text-sm text-red-600">Failed to load reviews.</p>
        ) : reviews.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Be the first to review this book.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-xl border border-line bg-cream/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink"><ReviewerName review={review} /></p>
                    <Stars rating={review.rating} />
                  </div>
                  <div className="flex items-center gap-3">
                    {formatDate(review.createdAt) && (
                      <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
                    )}
                    {review.userId === userId && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            setRating(review.rating);
                            setComment(review.comment ?? "");
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(review.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {review.comment && <p className="mt-2 text-sm leading-6 text-muted">{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 rounded-xl border border-dashed border-line p-4">
          <p className="text-sm font-semibold text-ink">
            {myReview ? "Edit your review" : "Write a review"}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={rating} interactive onChange={setRating} />
            <span className="text-xs text-muted">{rating} / 5</span>
          </div>
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share your thoughts about this book (optional)..."
            rows={3}
            className="mt-3"
          />
          {(create.isError || update.isError) && (
            <p className="mt-2 text-sm text-red-600">
              {(create.error as Error)?.message ?? (update.error as Error)?.message}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={create.isPending || update.isPending}
              onClick={handleSubmit}
            >
              {myReview ? "Update review" : "Submit review"}
            </Button>
            {myReview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setComment("");
                  setRating(5);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}