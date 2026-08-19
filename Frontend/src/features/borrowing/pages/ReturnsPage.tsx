import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReturnItem } from "@/features/borrowing/hooks/useBorrowing";
import { useBorrowRows, isOverdue } from "@/features/borrowing/hooks/useBorrowRows";
import type { BorrowItem } from "@/types/borrow.types";

const CONDITION_OPTIONS = ["Good", "Fair", "Poor", "Damaged"];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function overdueDays(item: BorrowItem) {
  return Math.max(0, Math.floor((Date.now() - new Date(item.dueDate).getTime()) / 86400000));
}

export default function ReturnsPage() {
  const { rows, isLoading, isError, error } = useBorrowRows();
  const returnItem = useReturnItem();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"open" | "returned" | "all">("open");
  const [returning, setReturning] = useState<BorrowItem | null>(null);
  const [condition, setCondition] = useState("Good");
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ item, user, book, copy }) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "open" && item.status === "Borrowed") ||
        (filter === "returned" && item.status === "Returned");
      if (!matchesFilter) return false;
      if (!q) return true;
      return (
        (book?.title ?? "").toLowerCase().includes(q) ||
        (user ? `${user.firstName} ${user.lastName}` : "").toLowerCase().includes(q) ||
        (copy?.barcode ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, filter]);

  const openReturn = (item: BorrowItem) => {
    setReturning(item);
    setCondition("Good");
  };

  const confirmReturn = async () => {
    if (!returning) return;
    try {
      await returnItem.mutateAsync({ id: returning.id, conditionAtReturn: condition });
      setMessage({ text: "Item returned successfully.", kind: "success" });
      setReturning(null);
    } catch {
      setMessage({ text: "Failed to return item.", kind: "error" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-1 w-10 bg-camel" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-camel-dark">Library</p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink">Returns</h1>
            <p className="mt-1 text-sm text-muted">Receive returned books and record their condition.</p>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by book, borrower, or barcode..."
            aria-label="Search returns"
            className="h-9 w-72 text-xs"
          />
        </div>

        {message && (
          <div
            className={`mb-4 rounded-card border px-4 py-2.5 text-sm ${
              message.kind === "error"
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {(["open", "returned", "all"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                filter === option
                  ? "bg-ink text-card"
                  : "bg-card text-muted hover:bg-cream-deep hover:text-ink"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Loading returns...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load returns: {(error as Error).message}
            </p>
          ) : filteredRows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No returns found.</p>
              <p className="mt-1 text-sm text-muted">
                {search || filter !== "all" ? "Try adjusting filters." : "All shelves are empty — no books awaiting return."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-camel-dark">
                    <th className="px-6 py-3 font-semibold">Book</th>
                    <th className="px-6 py-3 font-semibold">Borrower</th>
                    <th className="px-6 py-3 font-semibold">Copy</th>
                    <th className="px-6 py-3 font-semibold">Borrowed</th>
                    <th className="px-6 py-3 font-semibold">Due</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filteredRows.map(({ item, user, book, copy }) => (
                    <tr key={item.id} className="transition-colors hover:bg-cream/40">
                      <td className="max-w-[220px] truncate px-6 py-4 font-semibold text-ink">
                        {book?.title ?? `Book #${copy?.bookId ?? item.bookCopyId}`}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {user ? `${user.firstName} ${user.lastName}` : `User #${item.borrowTransactionId}`}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-ink">{copy?.barcode ?? `#${item.bookCopyId}`}</td>
                      <td className="px-6 py-4 text-muted">{formatDate(item.borrowedAt)}</td>
                      <td className={`px-6 py-4 font-medium ${isOverdue(item) ? "text-red-600" : "text-muted"}`}>
                        {formatDate(item.dueDate)}
                        {isOverdue(item) && (
                          <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">
                            {overdueDays(item)}d late
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === "Returned" ? "secondary" : item.status === "Borrowed" ? "default" : "outline"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.status === "Borrowed" && (
                          <Button size="xs" onClick={() => openReturn(item)}>
                            Return
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialog open={Boolean(returning)} onOpenChange={(next) => !next && setReturning(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Return book</DialogTitle>
            <DialogDescription>Record the condition of the book at return.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="returnCondition">Condition at return</Label>
            <Select
              id="returnCondition"
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturning(null)}>
              Cancel
            </Button>
            <Button onClick={confirmReturn} disabled={returnItem.isPending}>
              {returnItem.isPending ? "Returning..." : "Confirm return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}