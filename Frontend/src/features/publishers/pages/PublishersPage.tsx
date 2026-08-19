import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  usePublishers,
  useCreatePublisher,
  useUpdatePublisher,
  useDeletePublisher,
} from "@/features/publishers/hooks/usePublishers";
import type { Publisher, PublisherDto } from "@/types/book.types";

const publisherSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  website: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

type PublisherFormValues = z.infer<typeof publisherSchema>;

function toFormValues(publisher: Publisher | null): PublisherFormValues {
  return {
    name: publisher?.name ?? "",
    website: publisher?.website ?? "",
    email: publisher?.email ?? "",
    phone: publisher?.phone ?? "",
    address: publisher?.address ?? "",
  };
}

function toDto(values: PublisherFormValues): PublisherDto {
  return {
    name: values.name,
    website: values.website || null,
    email: values.email || null,
    phone: values.phone || null,
    address: values.address || null,
  };
}

export default function PublishersPage() {
  const { data: publishers = [], isLoading, isError, error } = usePublishers();
  const createPublisher = useCreatePublisher();
  const updatePublisher = useUpdatePublisher();
  const deletePublisher = useDeletePublisher();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Publisher | null>(null);
  const [deleting, setDeleting] = useState<Publisher | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const showSuccess = (text: string) => setMessage({ text, kind: "success" });
  const showError = (text: string) => setMessage({ text, kind: "error" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return publishers;
    return publishers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.website ?? "").toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q),
    );
  }, [publishers, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (publisher: Publisher) => {
    setEditing(publisher);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deletePublisher.mutateAsync(deleting.id);
      showSuccess("Publisher deleted.");
      setDeleting(null);
    } catch {
      showError("Failed to delete publisher.");
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
            <h1 className="text-3xl font-extrabold tracking-tight text-ink">Publishers</h1>
            <p className="mt-1 text-sm text-muted">Manage the publishers in your collection.</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search publishers..."
              aria-label="Search publishers"
              className="h-9 w-64 text-xs"
            />
            <Button onClick={openCreate}>+ Add Publisher</Button>
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
            <p className="px-6 py-16 text-center text-sm text-muted">Loading publishers...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load publishers: {(error as Error).message}
            </p>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No publishers found.</p>
              <p className="mt-1 text-sm text-muted">
                {search ? "Try a different search." : "Add your first publisher to get started."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-camel-dark">
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Website</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Phone</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {filtered.map((publisher) => (
                  <tr key={publisher.id} className="transition-colors hover:bg-cream/40">
                    <td className="px-6 py-4 font-semibold text-ink">{publisher.name}</td>
                    <td className="max-w-[180px] truncate px-6 py-4 text-muted">
                      {publisher.website ?? "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-6 py-4 text-muted">
                      {publisher.email ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-muted">{publisher.phone ?? "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="xs" onClick={() => openEdit(publisher)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        className="ml-2"
                        onClick={() => setDeleting(publisher)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <PublisherFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        publisher={editing}
        isSubmitting={createPublisher.isPending || updatePublisher.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updatePublisher.mutateAsync({ id: editing.id, dto: toDto(values) });
              showSuccess("Publisher updated.");
            } else {
              await createPublisher.mutateAsync(toDto(values));
              showSuccess("Publisher created.");
            }
            setFormOpen(false);
          } catch {
            showError("Failed to save publisher.");
          }
        }}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete publisher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold text-ink">{deleting?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmDelete} disabled={deletePublisher.isPending}>
                {deletePublisher.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PublisherFormDialog({
  open,
  onOpenChange,
  publisher,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publisher: Publisher | null;
  isSubmitting: boolean;
  onSubmit: (values: PublisherFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PublisherFormValues>({
    resolver: zodResolver(publisherSchema),
    defaultValues: toFormValues(publisher),
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(publisher));
    }
  }, [open, publisher, reset]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{publisher ? "Edit publisher" : "Add publisher"}</DialogTitle>
          <DialogDescription>
            {publisher ? "Update the details for this publisher." : "Add a new publisher to the collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Penguin Books" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://..." {...register("website")} />
              {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="contact@..." {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="e.g. +1 555 000 0000" {...register("phone")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Street, city, country." {...register("address")} />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : publisher ? "Save changes" : "Add publisher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}