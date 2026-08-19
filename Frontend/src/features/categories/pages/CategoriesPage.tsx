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
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/features/categories/hooks/useCategories";
import type { Category, CategoryDto } from "@/types/book.types";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  description: z.string().trim().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

function toFormValues(category: Category | null): CategoryFormValues {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
  };
}

function toDto(values: CategoryFormValues): CategoryDto {
  return {
    name: values.name,
    description: values.description || null,
  };
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading, isError, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const showSuccess = (text: string) => setMessage({ text, kind: "success" });
  const showError = (text: string) => setMessage({ text, kind: "error" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [categories, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCategory.mutateAsync(deleting.id);
      showSuccess("Category deleted.");
      setDeleting(null);
    } catch {
      showError("Failed to delete category.");
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
            <h1 className="text-3xl font-extrabold tracking-tight text-ink">Categories</h1>
            <p className="mt-1 text-sm text-muted">Organize your collection by category.</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              aria-label="Search categories"
              className="h-9 w-64 text-xs"
            />
            <Button onClick={openCreate}>+ Add Category</Button>
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
            <p className="px-6 py-16 text-center text-sm text-muted">Loading categories...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load categories: {(error as Error).message}
            </p>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No categories found.</p>
              <p className="mt-1 text-sm text-muted">
                {search ? "Try a different search." : "Add your first category to get started."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-camel-dark">
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Description</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {filtered.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-cream/40">
                    <td className="px-6 py-4 font-medium text-ink">{category.name}</td>
                    <td className="max-w-md truncate px-6 py-4 text-muted">
                      {category.description ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="xs" onClick={() => openEdit(category)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        className="ml-2"
                        onClick={() => setDeleting(category)}
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

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateCategory.mutateAsync({ id: editing.id, dto: toDto(values) });
              showSuccess("Category updated.");
            } else {
              await createCategory.mutateAsync(toDto(values));
              showSuccess("Category created.");
            }
            setFormOpen(false);
          } catch {
            showError("Failed to save category.");
          }
        }}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-ink">{deleting?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteCategory.isPending}>
                {deleteCategory.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  isSubmitting: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: toFormValues(category),
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(category));
    }
  }, [open, category, reset]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update the details for this category." : "Add a new category to the collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Science Fiction" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A short description of this category."
              {...register("description")}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : category ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}