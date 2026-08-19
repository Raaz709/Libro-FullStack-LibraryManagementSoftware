import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/users.api";
import { useFines } from "@/features/fines/hooks/useFines";
import { useDeletePayment, usePayments } from "@/features/payments/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { MessageBanner } from "@/components/ui/message-banner";
import { formatNPR } from "@/lib/currency";
import type { Payment } from "@/types/payments.types";

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function PaymentsPage() {
  const { data: payments = [], isLoading, isError, error } = usePayments();
  const deletePayment = useDeletePayment();
  const role = useAuthStore((state) => state.user?.role);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
    retry: false,
  });
  const { data: fines = [] } = useFines();

  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Payment | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const isAdmin = role === "Admin";
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const fineById = useMemo(() => new Map(fines.map((f) => [f.id, f])), [fines]);

  const totalCollected = useMemo(
    () => payments.reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  );

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments
      .filter((payment) => {
        if (!q) return true;
        const user = userById.get(payment.userId);
        return (
          (user ? `${user.firstName} ${user.lastName} ${user.email}` : String(payment.userId))
            .toLowerCase()
            .includes(q) ||
          (payment.transactionReference ?? "").toLowerCase().includes(q) ||
          String(payment.fineId) === q
        );
      })
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }, [payments, userById, search]);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deletePayment.mutateAsync(deleting.id);
      setMessage({ text: "Payment record deleted.", kind: "success" });
      setDeleting(null);
    } catch {
      setMessage({ text: "Failed to delete payment record.", kind: "error" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Library"
          title="Payments"
          description="Payment history for fines across all users."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by user, reference, or fine #..."
            aria-label="Search payments"
            className="h-9 w-72 text-xs"
          />
        </PageHeader>

        <MessageBanner message={message} />

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Total collected</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{formatNPR(totalCollected)}</p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Transactions</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{payments.length}</p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Last payment</p>
            <p className="mt-1 text-lg font-bold text-ink">
              {payments.length ? formatDateTime(payments[0].paidAt) : "—"}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Loading payments...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load payments: {(error as Error).message}
            </p>
          ) : filteredPayments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No payments found.</p>
              <p className="mt-1 text-sm text-muted">
                {search ? "Try adjusting your search." : "No payment records yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-camel-dark">
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Fine</th>
                    <th className="px-6 py-3 font-semibold">Amount</th>
                    <th className="px-6 py-3 font-semibold">Method</th>
                    <th className="px-6 py-3 font-semibold">Reference</th>
                    <th className="px-6 py-3 font-semibold">Paid at</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filteredPayments.map((payment) => {
                    const user = userById.get(payment.userId);
                    const fine = fineById.get(payment.fineId);
                    return (
                      <tr key={payment.id} className="transition-colors hover:bg-cream/40">
                        <td className="px-6 py-4 font-semibold text-ink">
                          {user ? `${user.firstName} ${user.lastName}` : `User #${payment.userId}`}
                          {user && <span className="block text-xs font-normal text-muted">{user.email}</span>}
                        </td>
                        <td className="px-6 py-4 text-muted">
                          #{payment.fineId}
                          {fine && <span className="block text-xs font-normal">{fine.type}</span>}
                        </td>
                        <td className="px-6 py-4 font-bold text-ink">{formatNPR(payment.amount)}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{payment.paymentMethod}</Badge>
                        </td>
                        <td className="max-w-[180px] truncate px-6 py-4 font-mono text-xs text-muted">
                          {payment.transactionReference ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-muted">{formatDateTime(payment.paidAt)}</td>
                        <td className="px-6 py-4 text-right">
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-red-600 hover:text-red-600"
                              onClick={() => setDeleting(payment)}
                            >
                              Delete
                            </Button>
                          )}
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

      <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this payment record?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the payment record. This action cannot be undone.
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