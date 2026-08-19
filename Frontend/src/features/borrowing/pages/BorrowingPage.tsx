import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { booksApi } from "@/api/books.api";
import { bookCopiesApi } from "@/api/bookCopies.api";
import { usersApi } from "@/api/users.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  useBorrowingData,
  useCreateBorrow,
  useRenewItem,
} from "@/features/borrowing/hooks/useBorrowing";
import type { BorrowItem, UserSummary } from "@/types/borrow.types";
import type { Book } from "@/types/book.types";

const CONDITION_OPTIONS = ["Good", "Fair", "Poor", "Damaged"];

const borrowSchema = z.object({
  userId: z.string().min(1, "Select a user."),
  bookId: z.string().min(1, "Select a book."),
  copyId: z.string().min(1, "Select an available copy."),
  dueDate: z.string().min(1, "Due date is required."),
  condition: z.enum(CONDITION_OPTIONS as [string, ...string[]]),
  notes: z.string().trim().optional(),
});

type BorrowFormValues = z.infer<typeof borrowSchema>;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function isOverdue(item: BorrowItem) {
  return item.status === "Borrowed" && new Date(item.dueDate).getTime() < Date.now();
}

export default function BorrowingPage() {
  const { data, isLoading, isError, error } = useBorrowingData();
  const createBorrow = useCreateBorrow();
  const renewItem = useRenewItem();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
    retry: false,
  });
  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: booksApi.getAll,
    retry: false,
  });
  const { data: allCopies = [] } = useQuery({
    queryKey: ["book-copies"],
    queryFn: bookCopiesApi.getAll,
    retry: false,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "overdue" | "returned" | "all">("active");
  const [formOpen, setFormOpen] = useState(false);
  const [renewing, setRenewing] = useState<BorrowItem | null>(null);
  const [renewDate, setRenewDate] = useState("");
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const showSuccess = (text: string) => setMessage({ text, kind: "success" });
  const showError = (text: string) => setMessage({ text, kind: "error" });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const transactions = useMemo(() => data?.transactions ?? [], [data?.transactions]);

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const bookById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const copyById = useMemo(() => new Map(allCopies.map((c) => [c.id, c])), [allCopies]);

  const transactionById = useMemo(
    () => new Map(transactions.map((t) => [t.id, t])),
    [transactions],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .map((item) => {
        const transaction = transactionById.get(item.borrowTransactionId);
        const copy = copyById.get(item.bookCopyId);
        const book = copy ? bookById.get(copy.bookId) : undefined;
        const user = transaction ? userById.get(transaction.userId) : undefined;
        return { item, user, book, copy };
      })
      .filter(({ item, user, book, copy }) => {
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.status === "Borrowed" && !isOverdue(item)) ||
          (statusFilter === "overdue" && isOverdue(item)) ||
          (statusFilter === "returned" && item.status === "Returned");
        if (!matchesStatus) return false;
        if (!q) return true;
        return (
          (book?.title ?? "").toLowerCase().includes(q) ||
          (user ? `${user.firstName} ${user.lastName}` : "").toLowerCase().includes(q) ||
          (copy?.barcode ?? "").toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.item.dueDate).getTime() - new Date(b.item.dueDate).getTime(),
      );
  }, [items, transactionById, copyById, bookById, userById, search, statusFilter]);

  const openRenew = (item: BorrowItem) => {
    setRenewing(item);
    setRenewDate(new Date(item.dueDate).toISOString().slice(0, 10));
  };

  const confirmRenew = async () => {
    if (!renewing || !renewDate) return;
    try {
      await renewItem.mutateAsync({ id: renewing.id, newDueDate: new Date(renewDate).toISOString() });
      showSuccess("Item renewed.");
      setRenewing(null);
    } catch {
      showError("Failed to renew item.");
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
            <h1 className="text-3xl font-extrabold tracking-tight text-ink">Borrowing</h1>
            <p className="mt-1 text-sm text-muted">Issue books to users and manage active loans.</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search book, user, or barcode..."
              aria-label="Search borrowing records"
              className="h-9 w-64 text-xs"
            />
            <Button onClick={() => setFormOpen(true)}>+ New Borrow</Button>
          </div>
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
          {(["active", "overdue", "returned", "all"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatusFilter(option)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                statusFilter === option
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
            <p className="px-6 py-16 text-center text-sm text-muted">Loading borrowing records...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load borrowing records: {(error as Error).message}
            </p>
          ) : rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No borrow records found.</p>
              <p className="mt-1 text-sm text-muted">
                {search || statusFilter !== "all" ? "Try adjusting filters." : "Issue the first book to get started."}
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
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {rows.map(({ item, user, book, copy }) => (
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
                        {isOverdue(item) && <span className="ml-2 text-xs font-bold uppercase">Overdue</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === "Returned" ? "secondary" : "default"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.status === "Borrowed" && (
                          <Button variant="outline" size="xs" onClick={() => openRenew(item)}>
                            Renew
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

      <NewBorrowDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        users={users}
        books={books}
        isSubmitting={createBorrow.isPending}
        onSubmit={async (values) => {
          try {
            const borrowedAt = new Date().toISOString();
            await createBorrow.mutateAsync({
              transaction: {
                userId: Number(values.userId),
                borrowedAt,
                notes: values.notes || null,
              },
              item: {
                borrowTransactionId: 0,
                bookCopyId: Number(values.copyId),
                borrowedAt,
                dueDate: new Date(values.dueDate).toISOString(),
                status: "Borrowed",
                renewalCount: 0,
                conditionAtBorrow: values.condition,
              },
            });
            showSuccess("Book issued successfully.");
            setFormOpen(false);
          } catch {
            showError("Failed to issue the book.");
          }
        }}
      />

      <Dialog open={Boolean(renewing)} onOpenChange={(next) => !next && setRenewing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Renew item</DialogTitle>
            <DialogDescription>Set a new due date for this borrowed item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="renewDate">New due date</Label>
              <Input
                id="renewDate"
                type="date"
                value={renewDate}
                onChange={(event) => setRenewDate(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewing(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRenew} disabled={renewItem.isPending}>
              {renewItem.isPending ? "Renewing..." : "Renew"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewBorrowDialog({
  open,
  onOpenChange,
  users,
  books,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserSummary[];
  books: Book[];
  isSubmitting: boolean;
  onSubmit: (values: BorrowFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      userId: "",
      bookId: "",
      copyId: "",
      dueDate: "",
      condition: "Good",
      notes: "",
    },
  });

  const selectedBookId = watch("bookId");
  const [bookSearch, setBookSearch] = useState("");

  const { data: availableCopies = [], isLoading: copiesLoading } = useQuery({
    queryKey: ["book-copies", "available", selectedBookId],
    queryFn: async () => {
      const copies = await booksApi.getCopies(Number(selectedBookId));
      return copies.filter((copy) => copy.status.toLowerCase() === "available");
    },
    enabled: open && Boolean(selectedBookId),
    retry: false,
  });

  const filteredBooks = useMemo(() => {
    const q = bookSearch.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => b.title.toLowerCase().includes(q));
  }, [books, bookSearch]);

  useEffect(() => {
    if (open) {
      reset({
        userId: "",
        bookId: "",
        copyId: "",
        dueDate: "",
        condition: "Good",
        notes: "",
      });
      setBookSearch("");
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New borrow</DialogTitle>
          <DialogDescription>
            Select a user, a book, an available copy, and a due date to issue the loan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="userId">User</Label>
            <Select id="userId" {...register("userId")}>
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} — {user.email}
                </option>
              ))}
            </Select>
            {errors.userId && <p className="text-xs text-red-500">{errors.userId.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="bookId">Book</Label>
            <Input
              value={bookSearch}
              onChange={(event) => setBookSearch(event.target.value)}
              placeholder="Search books..."
              aria-label="Search books"
              className="mb-1 h-9 text-xs"
            />
            <Select
              id="bookId"
              {...register("bookId", {
                onChange: () => setValue("copyId", ""),
              })}
            >
              <option value="">Select a book...</option>
              {filteredBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </Select>
            {errors.bookId && <p className="text-xs text-red-500">{errors.bookId.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="copyId">Available copy</Label>
            <Select id="copyId" {...register("copyId")} disabled={!selectedBookId || copiesLoading}>
              <option value="">
                {!selectedBookId ? "Select a book first" : copiesLoading ? "Loading copies..." : "Select a copy..."}
              </option>
              {availableCopies.map((copy) => (
                <option key={copy.id} value={copy.id}>
                  {copy.barcode} ({copy.conditionStatus})
                </option>
              ))}
            </Select>
            {errors.copyId && <p className="text-xs text-red-500">{errors.copyId.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="condition">Condition at borrow</Label>
              <Select id="condition" {...register("condition")}>
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional notes for this loan." {...register("notes")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Issuing..." : "Issue book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}