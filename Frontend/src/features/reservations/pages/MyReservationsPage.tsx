import { Link } from "react-router-dom";
import { BookMarked } from "lucide-react";
import { useMyReservations, useCancelReservation } from "@/features/reservations/hooks/useReservations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageState } from "@/components/ui/page-state";

const STATUS_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Waiting: "outline",
  Fulfilled: "default",
  Cancelled: "destructive",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MyReservationsPage() {
  const { data: reservations = [], isLoading, isError, error } = useMyReservations();
  const cancel = useCancelReservation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-ink/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Library"
          title="My Reservations"
          description="Books you have placed on hold."
        />

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted">Loading reservations...</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">Failed to load reservations: {(error as Error).message}</p>
        ) : reservations.length === 0 ? (
          <PageState
            icon={<BookMarked className="h-7 w-7 text-camel" />}
            title="No reservations yet."
            description="Browse the catalog and reserve a book that is currently unavailable."
          />
        ) : (
          <ul className="mt-6 space-y-3">
            {reservations.map((reservation) => (
              <li key={reservation.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/books/${reservation.bookId}`}
                        className="text-base font-semibold text-ink transition-colors hover:text-camel-dark"
                      >
                        {reservation.bookTitle ?? `Book #${reservation.bookId}`}
                      </Link>
                      <Badge variant={STATUS_TONE[reservation.status] ?? "secondary"}>{reservation.status}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-muted">
                      Reserved {formatDate(reservation.reservedAt)}
                      {reservation.expiresAt ? ` · expires ${formatDate(reservation.expiresAt)}` : ""}
                    </p>
                  </div>
                  {reservation.status === "Waiting" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={cancel.isPending}
                      onClick={() => cancel.mutate(reservation.id)}
                    >
                      Cancel reservation
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}