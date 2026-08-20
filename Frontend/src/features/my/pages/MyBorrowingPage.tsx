import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { PillTabs } from "@/components/ui/pill-tabs";
import { useAuthStore } from "@/store/authStore";
import { isLoanOverdue, useMyLoans } from "@/features/my/hooks/useMyLoans";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export default function MyBorrowingPage() {
  const userId = useAuthStore((state) => state.user?.userId);
  const { rows, currentLoans, overdueLoans, returnedLoans, isLoading, isError, error } =
    useMyLoans(userId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Active");

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ item, book, copy }) => {
      const matchesStatus =
        statusFilter === "Active"
          ? item.status === "Borrowed" && !isLoanOverdue(item)
          : statusFilter === "Overdue"
            ? isLoanOverdue(item)
            : item.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        (book?.title ?? "").toLowerCase().includes(q) ||
        (copy?.barcode ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Member"
          title="My Borrowing"
          description="Books you currently have and your borrowing history."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by book or barcode..."
            aria-label="Search my borrowing"
            className="h-9 w-64 text-xs"
          />
        </PageHeader>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Active</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{currentLoans.length}</p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Overdue</p>
            <p className={`mt-1 text-2xl font-extrabold ${overdueLoans.length ? "text-red-600" : "text-ink"}`}>
              {overdueLoans.length}
            </p>
          </div>
          <div className="rounded-card border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Returned</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{returnedLoans.length}</p>
          </div>
        </div>

        <PillTabs
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as typeof statusFilter)}
          options={[
            { value: "Active", label: "Active", count: currentLoans.length },
            { value: "Overdue", label: "Overdue", count: overdueLoans.length },
            { value: "Returned", label: "Returned" },
          ]}
        />

        <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Loading your loans...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load your loans: {(error as Error).message}
            </p>
          ) : filteredRows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink">No borrowed books here.</p>
              <p className="mt-1 text-sm text-muted">
                {search ? "Try adjusting your search." : "Books you borrow will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-camel-dark">
                    <th className="px-6 py-3 font-semibold">Book</th>
                    <th className="px-6 py-3 font-semibold">Copy</th>
                    <th className="px-6 py-3 font-semibold">Borrowed</th>
                    <th className="px-6 py-3 font-semibold">Due</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filteredRows.map(({ item, book, copy }) => (
                    <tr key={item.id} className="transition-colors hover:bg-cream/40">
                      <td className="max-w-[240px] truncate px-6 py-4 font-semibold text-ink">
                        {book?.title ?? `Book #${copy?.bookId ?? item.bookCopyId}`}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-ink">
                        {copy?.barcode ?? `#${item.bookCopyId}`}
                      </td>
                      <td className="px-6 py-4 text-muted">{formatDate(item.borrowedAt)}</td>
                      <td className={`px-6 py-4 font-medium ${isLoanOverdue(item) ? "text-red-600" : "text-muted"}`}>
                        {formatDate(item.dueDate)}
                        {isLoanOverdue(item) && <span className="ml-2 text-xs font-bold uppercase">Overdue</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === "Returned" ? "secondary" : "default"}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}