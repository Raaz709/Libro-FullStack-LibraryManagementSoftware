import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/features/users/hooks/useUsers";
import { PageHeader } from "@/components/layout/PageHeader";
import { MessageBanner } from "@/components/ui/message-banner";
import { ROLE_MAP } from "@/lib/constants";
import type { UserAdmin } from "@/types/users.types";

const STATUSES = ["Active", "Suspended"] as const;
const ROLE_IDS = [1, 2, 3, 4] as const;

const userFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email."),
    phone: z.string().optional(),
    roleId: z.number().int().min(1).max(4),
    status: z.enum(STATUSES),
    password: z.string().min(1, "Password is required."),
  })
  .superRefine((data, ctx) => {
    if (data.roleId !== 1 && data.roleId !== 2 && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 8 characters.",
        path: ["password"],
      });
    }
  });

type UserFormValues = z.infer<typeof userFormSchema>;

const roleBadgeVariant: Record<number, "default" | "secondary" | "outline" | "destructive"> = {
  1: "secondary",
  2: "secondary",
  3: "outline",
  4: "default",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export default function UsersPage() {
  const { data: users = [], isLoading, isError, error } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserAdmin | null>(null);
  const [deleting, setDeleting] = useState<UserAdmin | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((user) => {
        const matchesSearch =
          !q ||
          `${user.firstName} ${user.lastName} ${user.email} ${user.membershipNumber}`
            .toLowerCase()
            .includes(q);
        const matchesRole = !roleFilter || String(user.roleId) === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => b.id - a.id);
  }, [users, search, roleFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: UserAdmin) => {
    setEditing(user);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteUser.mutateAsync(deleting.id);
      setMessage({ text: "User deleted.", kind: "success" });
      setDeleting(null);
    } catch {
      setMessage({ text: "Failed to delete user.", kind: "error" });
    }
  };

  return (
    <div className="bg-cream min-h-screen p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-48 w-48 rounded-full bg-cream/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Admin"
          title="Users"
          description="Manage member and staff accounts."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, or membership..."
            aria-label="Search users"
            className="h-9 w-64 text-xs"
          />
          <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter by role">
            <option value="">All roles</option>
            {ROLE_IDS.map((id) => (
              <option key={id} value={id}>
                {ROLE_MAP[id]}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Button onClick={openCreate}>+ New User</Button>
        </PageHeader>

        <MessageBanner message={message} />

        <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Loading users...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load users: {(error as Error).message}
            </p>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No users found.</p>
              <p className="mt-1 text-sm text-muted">Try adjusting filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-muted">
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Membership</th>
                    <th className="px-6 py-3 font-semibold">Role</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Joined</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-slate-600">
                            {user.firstName?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-ink">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="truncate text-xs text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-ink">{user.membershipNumber || "—"}</td>
                      <td className="px-6 py-4">
                        <Badge variant={roleBadgeVariant[user.roleId] ?? "secondary"}>
                          {ROLE_MAP[user.roleId] ?? `Role ${user.roleId}`}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === "Active" ? "secondary" : "destructive"}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="xs" onClick={() => openEdit(user)}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            className="text-red-600 hover:text-red-600"
                            onClick={() => setDeleting(user)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <UserDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        isSubmitting={createUser.isPending || updateUser.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateUser.mutateAsync({
                id: editing.id,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phone: values.phone || null,
                roleId: values.roleId,
                status: values.status,
              });
              setMessage({ text: "User updated.", kind: "success" });
            } else {
              await createUser.mutateAsync({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phone: values.phone || null,
                passwordHash: values.password,
                roleId: values.roleId,
                status: values.status,
              });
              setMessage({ text: "User created.", kind: "success" });
            }
            setFormOpen(false);
          } catch (err) {
            const messageText =
              (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              "Failed to save user.";
            setMessage({ text: messageText, kind: "error" });
          }
        }}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {deleting?.firstName} {deleting?.lastName}'s account. This action cannot be undone.
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

function UserDialog({
  open,
  onOpenChange,
  editing,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: UserAdmin | null;
  isSubmitting: boolean;
  onSubmit: (values: UserFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { roleId: 1, status: "Active", password: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        firstName: editing?.firstName ?? "",
        lastName: editing?.lastName ?? "",
        email: editing?.email ?? "",
        phone: editing?.phone ?? "",
        roleId: editing?.roleId ?? 1,
        status: (editing?.status as (typeof STATUSES)[number]) ?? "Active",
        password: "",
      });
    }
  }, [open, editing, reset]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit user" : "New user"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update this account's details." : "Create a member or staff account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" placeholder="John" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" placeholder="Doe" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="98XXXXXXXX" {...register("phone")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="roleId">Role</Label>
              <Select id="roleId" {...register("roleId", { valueAsNumber: true })}>
                {ROLE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {ROLE_MAP[id]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register("status")}>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {!editing && (
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Temporary password" {...register("password")} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}