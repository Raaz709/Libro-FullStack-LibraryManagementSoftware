import { useState } from "react";
import { BookMarked } from "lucide-react";
import { useAllReservations, useCancelReservation, useFulfillReservation } from "@/features/reservations/hooks/useReservations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

export default function ReservationsPage() {
  const { data: reservations = [], isLoading, isError, error } = useAllReservations();
  const cancel = useCancelReservation();
  const fulfill = useFulfillReservation();
  const [search, setSearch] = useState("");

  const filtered = reservations.filter((reservation) =>
    `${reservation.bookTitle ?? ""} ${reservation.firstName ?? ""} ${reservation.lastName ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const waitingCount = reservations.filter((r) => r.status === "Waiting").length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-ink/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Circulation"
          title="Reservations"
          description={`${waitingCount} waiting, ${reservations.length} total.`}
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by book or member..."
            aria-label="Search reservations"
            className="h-9 w-64 text-xs"
          />
        </PageHeader>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted">Loading reservations...</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">Failed to load reservations: {(error as Error).message}</p>
        ) : filtered.length === 0 ? (
          <PageState
            icon={<BookMarked className="h-7 w-7 text-camel" />}
            title={reservations.length === 0 ? "No reservations." : "No reservations match your search."}
            description={
              reservations.length === 0
                ? "Members will appear here when they reserve unavailable books."
                : "Try adjusting your search."
            }
          />
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-cream/60 text-xs uppercase tracking-[0.12em] text-muted">
                    <th className="px-5 py-3 font-medium">Book</th>
                    <th className="px-5 py-3 font-medium">Member</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Reserved</th>
                    <th className="px-5 py-3 font-medium">Expires</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((reservation) => (
                    <tr key={reservation.id} className="transition-colors hover:bg-cream/50">
                      <td className="px-5 py-4 font-medium text-ink">
                        {reservation.bookTitle ?? `Book #${reservation.bookId}`}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {`${reservation.firstName ?? ""} ${reservation.lastName ?? ""}`.trim() || `Member #${reservation.userId}`}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={STATUS_TONE[reservation.status] ?? "secondary"}>{reservation.status}</Badge>
                      </td>
                      <td className="px-5 py-4 text-muted">{formatDate(reservation.reservedAt)}</td>
                      <td className="px-5 py-4 text-muted">{formatDate(reservation.expiresAt)}</td>
                      <td className="px-5 py-4 text-right">
                        {reservation.status === "Waiting" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              disabled={fulfill.isPending}
                              onClick={() => fulfill.mutate(reservation.id)}
                            >
                              Fulfill
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                              disabled={cancel.isPending}
                              onClick={() => cancel.mutate(reservation.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}