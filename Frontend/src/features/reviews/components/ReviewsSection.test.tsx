import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewsSection from "./ReviewsSection";
import { useAuthStore } from "@/store/authStore";
import type { useReviewMutations as UseReviewMutationsFn } from "@/features/reviews/hooks/useReviews";

type Mutations = ReturnType<typeof UseReviewMutationsFn>;

function createMutation(): Mutations["create"] {
  return { mutate: vi.fn(), isPending: false, isError: false, error: null } as unknown as Mutations["create"];
}

vi.mock("@/features/reviews/hooks/useReviews", () => ({
  useBookReviews: vi.fn(),
  useReviewMutations: vi.fn(() => ({
    create: createMutation(),
    update: createMutation(),
    remove: createMutation(),
  })),
}));

import { useBookReviews, useReviewMutations } from "@/features/reviews/hooks/useReviews";

describe("ReviewsSection", () => {
  beforeEach(() => {
    vi.mocked(useBookReviews).mockReset();
    vi.mocked(useReviewMutations).mockReset();
    useAuthStore.setState({
      token: "test-token",
      user: { userId: 7, email: "student@libro.test", role: "Student", exp: 2000000000 },
      isAuthenticated: true,
      isHydrating: false,
    });
  });

  it("shows an empty state when there are no reviews", () => {
    vi.mocked(useBookReviews).mockReturnValue({
      data: { reviews: [], summary: { averageRating: 0, count: 0 } },
      isLoading: false,
      isError: false,
    } as never);

    render(<ReviewsSection bookId={1} />);

    expect(screen.getByText("Be the first to review this book.")).toBeInTheDocument();
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
  });

  it("renders reviews and the average rating", () => {
    vi.mocked(useBookReviews).mockReturnValue({
      data: {
        reviews: [
          {
            id: 11,
            userId: 7,
            bookId: 1,
            rating: 5,
            comment: "Excellent read.",
            createdAt: "2026-08-01T00:00:00Z",
            updatedAt: null,
            firstName: "Student",
            lastName: "Demo",
          },
        ],
        summary: { averageRating: 5, count: 1 },
      },
      isLoading: false,
      isError: false,
    } as never);

    render(<ReviewsSection bookId={1} />);

    expect(screen.getByText("Excellent read.")).toBeInTheDocument();
    expect(screen.getByText("Student Demo")).toBeInTheDocument();
    expect(screen.getByText(/5.0 average from 1 review/)).toBeInTheDocument();
  });

  it("submits a review with the chosen rating", async () => {
    const user = userEvent.setup();
    const create = createMutation();
    vi.mocked(useReviewMutations).mockReturnValue({
      create,
      update: createMutation(),
      remove: createMutation(),
    } as unknown as Mutations);
    vi.mocked(useBookReviews).mockReturnValue({
      data: { reviews: [], summary: { averageRating: 0, count: 0 } },
      isLoading: false,
      isError: false,
    } as never);

    render(<ReviewsSection bookId={1} />);

    await user.type(screen.getByPlaceholderText(/Share your thoughts/), "Great book");
    await user.click(screen.getByRole("button", { name: "Submit review" }));

    expect(create.mutate).toHaveBeenCalledWith(
      { bookId: 1, rating: 5, comment: "Great book" },
      expect.any(Object),
    );
  });
});