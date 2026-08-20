import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/api/payments.api";
import { finesApi } from "@/api/fines.api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { formatNPR } from "@/lib/currency";

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function MyPaymentsPage() {
  const userId = useAuthStore((state) => state.user?.userId);

  const { data: payments = [], isLoading, isError, error } = useQuery({
    queryKey: ["my-payments", userId],
    queryFn: () => paymentsApi.getByUser(userId!),
    enabled: Boolean(userId),
    retry: false,
  });

  const { data: fines = [] } = useQuery({
    queryKey: ["my-fines", userId],
    queryFn: () => finesApi.getByUser(userId!),
    enabled: Boolean(userId),
    retry: false,
  });

  const [search, setSearch] = useState("");

  const fineById = useMemo(() => new Map(fines.map((fine) => [fine.id, fine])), [fines]);

  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  );

  const mostRecent = useMemo(() => {
    if (!payments.length) return null;
    return [...payments].sort(
      (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
    )[0];
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments
      .filter(
        (payment) =>
          !q ||
          (payment.transactionReference ?? "").toLowerCase().includes(q) ||
          String(payment.fineId) === q ||
          payment.paymentMethod.toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }, [payments, search]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Member"
          title="My Payments"
          description="Payment history for fines on your account."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by reference, method, or fine #..."
            aria-label="Search my payments"
            className="h-9 w-72 text-xs"
          />
        </PageHeader>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Total paid</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{formatNPR(totalPaid)}</p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Transactions</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{payments.length}</p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Last payment</p>
            <p className="mt-1 text-lg font-bold text-ink">
              {mostRecent ? formatDateTime(mostRecent.paidAt) : "—"}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Loading your payments...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load your payments: {(error as Error).message}
            </p>
          ) : filteredPayments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No payments found.</p>
              <p className="mt-1 text-sm text-muted">
                {search ? "Try adjusting your search." : "Payments you make will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-camel-dark">
                    <th className="px-6 py-3 font-semibold">Fine</th>
                    <th className="px-6 py-3 font-semibold">Amount</th>
                    <th className="px-6 py-3 font-semibold">Method</th>
                    <th className="px-6 py-3 font-semibold">Reference</th>
                    <th className="px-6 py-3 font-semibold">Paid at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filteredPayments.map((payment) => {
                    const fine = fineById.get(payment.fineId);
                    return (
                      <tr key={payment.id} className="transition-colors hover:bg-cream/40">
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}