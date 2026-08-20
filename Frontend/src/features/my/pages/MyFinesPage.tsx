import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { finesApi } from "@/api/fines.api";
import { paymentsApi } from "@/api/payments.api";
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
import { PageHeader } from "@/components/layout/PageHeader";
import { PillTabs } from "@/components/ui/pill-tabs";
import { MessageBanner } from "@/components/ui/message-banner";
import { useAuthStore } from "@/store/authStore";
import { formatNPR } from "@/lib/currency";
import type { Fine } from "@/types/fines.types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Unpaid: "destructive",
  Paid: "secondary",
  Waived: "outline",
};

const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "Mobile Banking", "Other"] as const;

const paymentSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  transactionReference: z.string().trim().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function MyFinesPage() {
  const userId = useAuthStore((state) => state.user?.userId);
  const queryClient = useQueryClient();

  const { data: fines = [], isLoading, isError, error } = useQuery({
    queryKey: ["my-fines", userId],
    queryFn: () => finesApi.getByUser(userId!),
    enabled: Boolean(userId),
    retry: false,
  });

  const payFine = useMutation({
    mutationFn: ({
      fine,
      values,
    }: {
      fine: Fine;
      values: PaymentFormValues;
    }) =>
      paymentsApi.create({
        fineId: fine.id,
        amount: fine.amount,
        paymentMethod: values.paymentMethod,
        transactionReference: values.transactionReference || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-fines", userId] });
      queryClient.invalidateQueries({ queryKey: ["my-payments", userId] });
    },
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Unpaid");
  const [paying, setPaying] = useState<Fine | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const unpaidTotal = useMemo(
    () => fines.filter((fine) => fine.status === "Unpaid").reduce((sum, fine) => sum + fine.amount, 0),
    [fines],
  );

  const filteredFines = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fines
      .filter((fine) => statusFilter === "All" || fine.status === statusFilter)
      .filter(
        (fine) =>
          !q ||
          fine.type.toLowerCase().includes(q) ||
          (fine.reason ?? "").toLowerCase().includes(q) ||
          String(fine.id) === q,
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [fines, search, statusFilter]);

  const confirmPay = async (values: PaymentFormValues) => {
    if (!paying) return;
    try {
      await payFine.mutateAsync({ fine: paying, values });
      setMessage({ text: "Payment processed successfully.", kind: "success" });
      setPaying(null);
    } catch {
      setMessage({ text: "Payment failed. The fine may already be paid.", kind: "error" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Member"
          title="My Fines"
          description="Charges on your account for overdue, damaged, or lost books."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by type, reason, or fine #..."
            aria-label="Search my fines"
            className="h-9 w-64 text-xs"
          />
        </PageHeader>

        <MessageBanner message={message} />

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Outstanding</p>
            <p className={`mt-1 text-2xl font-extrabold ${unpaidTotal > 0 ? "text-red-600" : "text-ink"}`}>
              {formatNPR(unpaidTotal)}
            </p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Unpaid fines</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {fines.filter((fine) => fine.status === "Unpaid").length}
            </p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Total billed</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {formatNPR(fines.reduce((sum, fine) => sum + fine.amount, 0))}
            </p>
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
            <p className="px-6 py-16 text-center text-sm text-muted">Loading your fines...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load your fines: {(error as Error).message}
            </p>
          ) : filteredFines.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No fines found.</p>
              <p className="mt-1 text-sm text-muted">
                {search || statusFilter !== "All" ? "Try adjusting filters." : "You have no fines on record."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-camel-dark">
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Amount</th>
                    <th className="px-6 py-3 font-semibold">Reason</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Created</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filteredFines.map((fine) => (
                    <tr key={fine.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-6 py-4 text-muted">{fine.type}</td>
                      <td className={`px-6 py-4 font-bold ${fine.status === "Unpaid" ? "text-red-600" : "text-ink"}`}>
                        {formatNPR(fine.amount)}
                      </td>
                      <td className="max-w-[240px] truncate px-6 py-4 text-muted">{fine.reason ?? "—"}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[fine.status] ?? "secondary"}>{fine.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted">{new Date(fine.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        {fine.status === "Unpaid" && (
                          <Button variant="outline" size="xs" onClick={() => setPaying(fine)}>
                            Pay
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

      <PayDialog
        fine={paying}
        onOpenChange={(next) => !next && setPaying(null)}
        isSubmitting={payFine.isPending}
        onSubmit={confirmPay}
      />
    </div>
  );
}

function PayDialog({
  fine,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: {
  fine: Fine | null;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentMethod: "Cash", transactionReference: "" },
  });

  return (
    <Dialog open={Boolean(fine)} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay fine</DialogTitle>
          <DialogDescription>
            {fine
              ? `Pay ${formatNPR(fine.amount)} for your ${fine.type.toLowerCase()} fine (#${fine.id}).`
              : "Confirm your payment details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="paymentMethod">Payment method</Label>
            <Select id="paymentMethod" {...register("paymentMethod")}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="transactionReference">Transaction reference</Label>
            <Input
              id="transactionReference"
              placeholder="Optional reference number"
              {...register("transactionReference")}
            />
            {errors.transactionReference && (
              <p className="text-xs text-red-500">{errors.transactionReference.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : `Pay ${fine ? formatNPR(fine.amount) : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}