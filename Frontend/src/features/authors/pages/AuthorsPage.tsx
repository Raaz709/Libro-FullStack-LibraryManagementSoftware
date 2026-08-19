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
import { useAuthors, useCreateAuthor, useUpdateAuthor, useDeleteAuthor } from "@/features/authors/hooks/useAuthors";
import type { Author, AuthorDto } from "@/types/book.types";

const authorSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  country: z.string().trim().optional(),
  birthDate: z.string().optional(),
  biography: z.string().trim().optional(),
  photoUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
});

type AuthorFormValues = z.infer<typeof authorSchema>;

function toFormValues(author: Author | null): AuthorFormValues {
  return {
    firstName: author?.firstName ?? "",
    lastName: author?.lastName ?? "",
    country: author?.country ?? "",
    birthDate: author?.birthDate ? author.birthDate.slice(0, 10) : "",
    biography: author?.biography ?? "",
    photoUrl: author?.photoUrl ?? "",
  };
}

function toDto(values: AuthorFormValues): AuthorDto {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    country: values.country || null,
    birthDate: values.birthDate ? new Date(values.birthDate).toISOString() : null,
    biography: values.biography || null,
    photoUrl: values.photoUrl || null,
  };
}

function fullName(author: Author): string {
  return `${author.firstName} ${author.lastName}`.trim();
}

export default function AuthorsPage() {
  const { data: authors = [], isLoading, isError, error } = useAuthors();
  const createAuthor = useCreateAuthor();
  const updateAuthor = useUpdateAuthor();
  const deleteAuthor = useDeleteAuthor();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [deleting, setDeleting] = useState<Author | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const showSuccess = (text: string) => setMessage({ text, kind: "success" });
  const showError = (text: string) => setMessage({ text, kind: "error" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter(
      (a) =>
        fullName(a).toLowerCase().includes(q) ||
        (a.country ?? "").toLowerCase().includes(q),
    );
  }, [authors, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (author: Author) => {
    setEditing(author);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteAuthor.mutateAsync(deleting.id);
      showSuccess("Author deleted.");
      setDeleting(null);
    } catch {
      showError("Failed to delete author.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f1ea] p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#c8a96b]/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-1 w-10 bg-[#b08a45]" />
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9a773c]">Library</p>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1f2937]">Authors</h1>
            <p className="mt-1 text-sm text-[#8f8a80]">Manage the authors of your collection.</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search authors..."
              aria-label="Search authors"
              className="h-9 w-64 text-xs"
            />
            <Button onClick={openCreate}>+ Add Author</Button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-md border px-4 py-2.5 text-sm ${
              message.kind === "error"
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-[#ded8cc] bg-white shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-[#8f8a80]">Loading authors...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load authors: {(error as Error).message}
            </p>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium text-[#374151]">No authors found.</p>
              <p className="mt-1 text-sm text-[#8f8a80]">
                {search ? "Try a different search." : "Add your first author to get started."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#eeeae2] bg-[#faf9f6] text-xs uppercase tracking-[0.12em] text-[#9a773c]">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Country</th>
                  <th className="px-6 py-3 font-medium">Birth Date</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeae2]">
                {filtered.map((author) => (
                  <tr key={author.id} className="transition-colors hover:bg-[#faf9f6]">
                    <td className="px-6 py-4 font-medium text-[#374151]">{fullName(author)}</td>
                    <td className="px-6 py-4 text-[#6b7280]">{author.country ?? "—"}</td>
                    <td className="px-6 py-4 text-[#6b7280]">
                      {author.birthDate ? new Date(author.birthDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="xs" onClick={() => openEdit(author)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        className="ml-2"
                        onClick={() => setDeleting(author)}
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

      <AuthorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        author={editing}
        isSubmitting={createAuthor.isPending || updateAuthor.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateAuthor.mutateAsync({ id: editing.id, dto: toDto(values) });
              showSuccess("Author updated.");
            } else {
              await createAuthor.mutateAsync(toDto(values));
              showSuccess("Author created.");
            }
            setFormOpen(false);
          } catch {
            showError("Failed to save author.");
          }
        }}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete author</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-[#1f2937]">{deleting ? fullName(deleting) : ""}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteAuthor.isPending}>
                {deleteAuthor.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AuthorFormDialog({
  open,
  onOpenChange,
  author,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: Author | null;
  isSubmitting: boolean;
  onSubmit: (values: AuthorFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: toFormValues(author),
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(author));
    }
  }, [open, author, reset]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{author ? "Edit author" : "Add author"}</DialogTitle>
          <DialogDescription>
            {author ? "Update the details for this author." : "Add a new author to the collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" placeholder="e.g. J.K." {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" placeholder="e.g. Rowling" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="e.g. United Kingdom" {...register("country")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="birthDate">Birth date</Label>
              <Input id="birthDate" type="date" {...register("birthDate")} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="biography">Biography</Label>
            <Textarea id="biography" placeholder="A short biography of the author." {...register("biography")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="photoUrl">Photo URL</Label>
            <Input id="photoUrl" type="url" placeholder="https://..." {...register("photoUrl")} />
            {errors.photoUrl && <p className="text-xs text-red-500">{errors.photoUrl.message}</p>}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : author ? "Save changes" : "Add author"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}