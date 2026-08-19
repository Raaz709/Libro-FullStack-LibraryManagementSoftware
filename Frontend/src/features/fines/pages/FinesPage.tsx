import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
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
  useCreateFine,
  useDeleteFine,
  useFines,
  useUpdateFine,
  useWaiveFine,
} from "@/features/fines/hooks/useFines";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { PillTabs } from "@/components/ui/pill-tabs";
import { MessageBanner } from "@/components/ui/message-banner";
import { formatNPR } from "@/lib/currency";
import type { Fine } from "@/types/fines.types";

const FINE_TYPES = ["Overdue", "Damage", "Lost", "Other"] as const;

const fineSchema = z.object({
  userId: z.string().min(1, "Select a user."),
  type: z.enum(FINE_TYPES),
  amount: z
    .string()
    .min(1, "Enter an amount.")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, "Enter a valid amount."),
  reason: z.string().trim().optional(),
});

type FineFormValues = z.infer<typeof fineSchema>;

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Unpaid: "destructive",
  Paid: "secondary",
  Waived: "outline",
};

export default function FinesPage() {
  const { data: fines = [], isLoading, isError, error } = useFines();
  const createFine = useCreateFine();
  const updateFine = useUpdateFine();
  const waiveFine = useWaiveFine();
  const deleteFine = useDeleteFine();
  const role = useAuthStore((state) => state.user?.role);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
    retry: false,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Unpaid");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Fine | null>(null);
  const [waiving, setWaiving] = useState<Fine | null>(null);
  const [deleting, setDeleting] = useState<Fine | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const isAdmin = role === "Admin";

  const filteredFines = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fines
      .filter((fine) => {
        const matchesStatus =
          statusFilter === "All" || fine.status === statusFilter;
        if (!matchesStatus) return false;
        if (!q) return true;
        const user = userById.get(fine.userId);
        return (
          user ? `${user.firstName} ${user.lastName} ${user.email}` : String(fine.userId)
        ).toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [fines, userById, search, statusFilter]);

  const totals = useMemo(() => {
    return {
      unpaid: fines.filter((f) => f.status === "Unpaid").reduce((sum, f) => sum + f.amount, 0),
      total: fines.reduce((sum, f) => sum + f.amount, 0),
    };
  }, [fines]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (fine: Fine) => {
    setEditing(fine);
    setFormOpen(true);
  };

  const confirmWaive = async () => {
    if (!waiving) return;
    try {
      await waiveFine.mutateAsync(waiving.id);
      setMessage({ text: "Fine waived.", kind: "success" });
      setWaiving(null);
    } catch {
      setMessage({ text: "Failed to waive fine.", kind: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteFine.mutateAsync(deleting.id);
      setMessage({ text: "Fine deleted.", kind: "success" });
      setDeleting(null);
    } catch {
      setMessage({ text: "Failed to delete fine.", kind: "error" });
    }
  };

  const formatAmount = (amount: number) => formatNPR(amount);

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Library"
          title="Fines"
          description="Manage charges for overdue, damaged, or lost books."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by user..."
            aria-label="Search fines"
            className="h-9 w-64 text-xs"
          />
          <Button onClick={openCreate}>+ New Fine</Button>
        </PageHeader>

        <MessageBanner message={message} />

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Outstanding</p>
            <p className="mt-1 text-2xl font-extrabold text-red-600">{formatAmount(totals.unpaid)}</p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Total billed</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{formatAmount(totals.total)}</p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Records</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{fines.length}</p>
          </div>
        </div>

        <PillTabs
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as typeof statusFilter)}
          options={[
            { value: "Unpaid", label: "Unpaid", count: fines.filter((f) => f.status === "Unpaid").length },
            { value: "Paid", label: "Paid" },
            { value: "Waived", label: "Waived" },
            { value: "All", label: "All" },
          ]}
        />

        <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Loading fines...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load fines: {(error as Error).message}
            </p>
          ) : filteredFines.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No fines found.</p>
              <p className="mt-1 text-sm text-muted">
                {search || statusFilter !== "All" ? "Try adjusting filters." : "No fines on record."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-camel-dark">
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Amount</th>
                    <th className="px-6 py-3 font-semibold">Reason</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Created</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filteredFines.map((fine) => {
                    const user = userById.get(fine.userId);
                    return (
                      <tr key={fine.id} className="transition-colors hover:bg-cream/40">
                        <td className="px-6 py-4 font-semibold text-ink">
                          {user ? `${user.firstName} ${user.lastName}` : `User #${fine.userId}`}
                          {user && <span className="block text-xs font-normal text-muted">{user.email}</span>}
                        </td>
                        <td className="px-6 py-4 text-muted">{fine.type}</td>
                        <td className={`px-6 py-4 font-bold ${fine.status === "Unpaid" ? "text-red-600" : "text-ink"}`}>
                          {formatAmount(fine.amount)}
                        </td>
                        <td className="max-w-[220px] truncate px-6 py-4 text-muted">{fine.reason ?? "—"}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariant[fine.status] ?? "secondary"}>{fine.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-muted">{new Date(fine.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="xs" onClick={() => openEdit(fine)}>
                              Edit
                            </Button>
                            {isAdmin && fine.status === "Unpaid" && (
                              <Button variant="outline" size="xs" onClick={() => setWaiving(fine)}>
                                Waive
                              </Button>
                            )}
                            {isAdmin && (
                              <Button variant="outline" size="xs" className="text-red-600 hover:text-red-600" onClick={() => setDeleting(fine)}>
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <FineDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        users={users}
        isSubmitting={createFine.isPending || updateFine.isPending}
        onSubmit={async (values) => {
          try {
            const payload = {
              userId: Number(values.userId),
              type: values.type,
              amount: Number(values.amount),
              reason: values.reason || null,
              status: editing?.status ?? "Unpaid",
            };
            if (editing) {
              await updateFine.mutateAsync({ ...payload, id: editing.id });
              setMessage({ text: "Fine updated.", kind: "success" });
            } else {
              await createFine.mutateAsync(payload);
              setMessage({ text: "Fine created.", kind: "success" });
            }
            setFormOpen(false);
          } catch {
            setMessage({ text: "Failed to save fine.", kind: "error" });
          }
        }}
      />

      <AlertDialog open={Boolean(waiving)} onOpenChange={(next) => !next && setWaiving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Waive this fine?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the fine as waived. The action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmWaive}>Waive fine</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this fine?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the fine record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FineDialog({
  open,
  onOpenChange,
  editing,
  users,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Fine | null;
  users: ReturnType<typeof usersApi.getAll> extends Promise<infer T> ? T : never;
  isSubmitting: boolean;
  onSubmit: (values: FineFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FineFormValues>({
    resolver: zodResolver(fineSchema),
    defaultValues: { userId: "", type: "Overdue", amount: "", reason: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        userId: editing ? String(editing.userId) : "",
        type: (editing?.type as (typeof FINE_TYPES)[number]) ?? "Overdue",
        amount: editing ? String(editing.amount) : "",
        reason: editing?.reason ?? "",
      });
    }
  }, [open, editing, reset]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit fine" : "New fine"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update the details of this fine." : "Record a fine against a user."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="userId">User</Label>
            <Select id="userId" {...register("userId")} disabled={Boolean(editing)}>
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} — {user.email}
                </option>
              ))}
            </Select>
            {errors.userId && <p className="text-xs text-red-500">{errors.userId.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Select id="type" {...register("type")}>
                {FINE_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="amount">Amount (रू)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("amount")}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" placeholder="Optional reason for this fine." {...register("reason")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create fine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}