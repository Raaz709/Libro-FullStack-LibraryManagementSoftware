import { useEffect, useMemo, useState } from "react";
import type { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { booksApi } from "@/api/books.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useBookCopies,
  useCreateBookCopy,
  useUpdateBookCopy,
  useDeleteBookCopy,
} from "@/features/bookCopies/hooks/useBookCopies";
import type { Book, BookCopy, BookCopyPayload } from "@/types/book.types";

const STATUS_OPTIONS = ["Available", "Borrowed", "Reserved"];
const CONDITION_OPTIONS = ["Good", "Fair", "Poor", "Damaged"];

const copySchema = z.object({
  bookId: z.string().min(1, "Select a book."),
  barcode: z.string().trim().min(1, "Barcode is required."),
  shelfId: z.string().trim().optional(),
  qrCode: z.string().trim().optional(),
  conditionStatus: z.enum(CONDITION_OPTIONS as [string, ...string[]]),
  status: z.enum(STATUS_OPTIONS as [string, ...string[]]),
  purchaseDate: z.string().optional(),
  price: z.string().trim().optional(),
});

type CopyFormValues = z.infer<typeof copySchema>;

function toFormValues(copy: BookCopy | null): CopyFormValues {
  return {
    bookId: copy?.bookId ? String(copy.bookId) : "",
    barcode: copy?.barcode ?? "",
    shelfId: copy?.shelfId ? String(copy.shelfId) : "",
    qrCode: copy?.qrCode ?? "",
    conditionStatus: copy?.conditionStatus ?? "Good",
    status: copy?.status ?? "Available",
    purchaseDate: copy?.purchaseDate ? copy.purchaseDate.slice(0, 10) : "",
    price: copy?.price != null ? String(copy.price) : "",
  };
}

function toPayload(values: CopyFormValues): BookCopyPayload {
  return {
    bookId: Number(values.bookId),
    barcode: values.barcode,
    shelfId: values.shelfId ? Number(values.shelfId) : null,
    qrCode: values.qrCode || null,
    conditionStatus: values.conditionStatus,
    status: values.status,
    purchaseDate: values.purchaseDate ? new Date(values.purchaseDate).toISOString() : null,
    price: values.price ? Number(values.price) : null,
  };
}

function formatPrice(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

export default function BookCopiesPage() {
  const { data: copies = [], isLoading, isError, error } = useBookCopies();
  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: booksApi.getAll,
    retry: false,
  });
  const createCopy = useCreateBookCopy();
  const updateCopy = useUpdateBookCopy();
  const deleteCopy = useDeleteBookCopy();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BookCopy | null>(null);
  const [deleting, setDeleting] = useState<BookCopy | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const showSuccess = (text: string) => setMessage({ text, kind: "success" });
  const showError = (text: string) => setMessage({ text, kind: "error" });

  const bookById = useMemo(() => {
    const map = new Map<number, Book>();
    books.forEach((book) => map.set(book.id, book));
    return map;
  }, [books]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return copies;
    return copies.filter((copy) => {
      const title = bookById.get(copy.bookId)?.title ?? "";
      return copy.barcode.toLowerCase().includes(q) || title.toLowerCase().includes(q);
    });
  }, [copies, search, bookById]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (copy: BookCopy) => {
    setEditing(copy);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCopy.mutateAsync(deleting.id);
      showSuccess("Book copy deleted.");
      setDeleting(null);
    } catch {
      showError("Failed to delete book copy.");
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
            <h1 className="text-3xl font-extrabold tracking-tight text-ink">Book Copies</h1>
            <p className="mt-1 text-sm text-muted">Manage individual copies of each book.</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by barcode or book..."
              aria-label="Search book copies"
              className="h-9 w-64 text-xs"
            />
            <Button onClick={openCreate}>+ Add Copy</Button>
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

        <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Loading book copies...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load book copies: {(error as Error).message}
            </p>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No book copies found.</p>
              <p className="mt-1 text-sm text-muted">
                {search ? "Try a different search." : "Add your first copy to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-camel-dark">
                    <th className="px-6 py-3 font-semibold">Barcode</th>
                    <th className="px-6 py-3 font-semibold">Book</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Condition</th>
                    <th className="px-6 py-3 font-semibold">Price</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filtered.map((copy) => (
                    <tr key={copy.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-ink">{copy.barcode}</td>
                      <td className="max-w-[260px] truncate px-6 py-4 font-semibold text-ink">
                        {bookById.get(copy.bookId)?.title ?? `Book #${copy.bookId}`}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={copy.status === "Available" ? "secondary" : "default"}>
                          {copy.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted">{copy.conditionStatus}</td>
                      <td className="px-6 py-4 text-muted">{formatPrice(copy.price)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="xs" onClick={() => openEdit(copy)}>
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="xs"
                          className="ml-2"
                          onClick={() => setDeleting(copy)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <CopyFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        copy={editing}
        books={books}
        isSubmitting={createCopy.isPending || updateCopy.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateCopy.mutateAsync({ id: editing.id, payload: toPayload(values) });
              showSuccess("Book copy updated.");
            } else {
              await createCopy.mutateAsync(toPayload(values));
              showSuccess("Book copy created.");
            }
            setFormOpen(false);
          } catch {
            showError("Failed to save book copy.");
          }
        }}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete book copy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete copy{" "}
              <span className="font-bold text-ink">{deleting?.barcode}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteCopy.isPending}>
                {deleteCopy.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CopyFormDialog({
  open,
  onOpenChange,
  copy,
  books,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: BookCopy | null;
  books: Book[];
  isSubmitting: boolean;
  onSubmit: (values: CopyFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CopyFormValues>({
    resolver: zodResolver(copySchema),
    defaultValues: toFormValues(copy),
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(copy));
    }
  }, [open, copy, reset]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{copy ? "Edit book copy" : "Add book copy"}</DialogTitle>
          <DialogDescription>
            {copy ? "Update the details for this copy." : "Add a new copy to the collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="bookId">Book</Label>
              <SelectField
                id="bookId"
                {...register("bookId")}
              >
                <option value="">Select a book...</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </SelectField>
              {errors.bookId && <p className="text-xs text-red-500">{errors.bookId.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" placeholder="e.g. CP-0001" {...register("barcode")} />
              {errors.barcode && <p className="text-xs text-red-500">{errors.barcode.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="status">Status</Label>
              <SelectField id="status" {...register("status")}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conditionStatus">Condition</Label>
              <SelectField id="conditionStatus" {...register("conditionStatus")}>
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="shelfId">Shelf ID</Label>
              <Input id="shelfId" type="number" placeholder="e.g. 3" {...register("shelfId")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="purchaseDate">Purchase date</Label>
              <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" placeholder="0.00" {...register("price")} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="qrCode">QR code</Label>
            <Input id="qrCode" placeholder="QR code value or URL" {...register("qrCode")} />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : copy ? "Save changes" : "Add copy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SelectField({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={`h-10 w-full rounded-soft border border-line bg-card px-3.5 py-2 text-sm text-ink shadow-sm transition-all duration-200 outline-none hover:border-camel/60 focus-visible:border-camel focus-visible:ring-[3px] focus-visible:ring-camel/15 disabled:pointer-events-none disabled:opacity-50 ${className ?? ""}`}
      {...props}
    >
      {children}
    </select>
  );
}