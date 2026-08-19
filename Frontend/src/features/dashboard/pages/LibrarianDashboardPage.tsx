import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Library,
  CheckCircle2,
  ArrowLeftRight,
  AlertTriangle,
  CircleDollarSign,
  ArrowRight,
} from "lucide-react";
import { useBorrowRows, isOverdue } from "@/features/borrowing/hooks/useBorrowRows";
import { useFines } from "@/features/fines/hooks/useFines";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { bookCopiesApi } from "@/api/bookCopies.api";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatNPR } from "@/lib/currency";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export default function LibrarianDashboardPage() {
  const { rows, isLoading, isError, error } = useBorrowRows();
  const { data: fines = [] } = useFines();

  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: booksApi.getAll,
    retry: false,
  });
  const { data: copies = [] } = useQuery({
    queryKey: ["book-copies"],
    queryFn: bookCopiesApi.getAll,
    retry: false,
  });

  const activeLoans = useMemo(() => rows.filter((row) => row.item.status === "Borrowed"), [rows]);
  const overdueLoans = useMemo(() => rows.filter((row) => isOverdue(row.item)), [rows]);
  const unpaidFines = useMemo(() => fines.filter((fine) => fine.status === "Unpaid"), [fines]);
  const unpaidTotal = unpaidFines.reduce((sum, fine) => sum + fine.amount, 0);

  const availableCopies = copies.filter((copy) => copy.status.toLowerCase() === "available").length;

  const recentLoans = useMemo(
    () =>
      [...rows]
        .sort((a, b) => new Date(b.item.borrowedAt).getTime() - new Date(a.item.borrowedAt).getTime())
        .slice(0, 6),
    [rows],
  );

  const stats = [
    {
      label: "Total books",
      value: books.length,
      to: "/librarian/books",
      icon: BookOpen,
      tone: "bg-camel/15 text-camel-dark",
    },
    {
      label: "Copies",
      value: copies.length,
      to: "/librarian/copies",
      icon: Library,
      tone: "bg-cream text-camel-dark",
    },
    {
      label: "Available copies",
      value: availableCopies,
      to: "/librarian/copies",
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Active loans",
      value: activeLoans.length,
      to: "/librarian/borrowing",
      icon: ArrowLeftRight,
      tone: "bg-cream text-camel-dark",
    },
    {
      label: "Overdue",
      value: overdueLoans.length,
      to: "/librarian/returns",
      icon: AlertTriangle,
      tone: "bg-red-50 text-red-600",
    },
    {
      label: "Unpaid fines",
      value: formatNPR(unpaidTotal),
      to: "/librarian/fines",
      icon: CircleDollarSign,
      tone: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Librarian"
          title="Dashboard"
          description="Library operations at a glance."
        />

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted">Loading dashboard...</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">
            Failed to load dashboard: {(error as Error).message}
          </p>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Link
                    key={stat.label}
                    to={stat.to}
                    className="group rounded-card border border-line bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-camel hover:shadow-md"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 truncate text-2xl font-extrabold tracking-tight text-ink">{stat.value}</p>
                    <p className="mt-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                      {stat.label}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              {/* Recent loans */}
              <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-line-soft px-6 py-4">
                  <h2 className="text-lg font-bold text-ink">Recent loans</h2>
                  <Link to="/librarian/borrowing" className="text-xs font-semibold text-camel-dark hover:text-ink">
                    Manage borrowing →
                  </Link>
                </div>
                {recentLoans.length === 0 ? (
                  <p className="px-6 py-12 text-center text-sm text-muted">No loans yet.</p>
                ) : (
                  <ul className="divide-y divide-line-soft">
                    {recentLoans.map(({ item, user, book, copy }) => (
                      <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
                          <BookOpen className="h-4 w-4 text-camel-dark" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-ink">
                            {book?.title ?? `Book #${copy?.bookId ?? item.bookCopyId}`}
                          </p>
                          <p className="text-xs text-muted">
                            {user ? `${user.firstName} ${user.lastName}` : `User #${item.borrowTransactionId}`}
                            {" · "}Copy {copy?.barcode ?? item.bookCopyId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-semibold ${isOverdue(item) ? "text-red-600" : "text-muted"}`}>
                            Due {formatDate(item.dueDate)}
                          </p>
                          <p className="text-xs text-muted">Borrowed {formatDate(item.borrowedAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="space-y-6">
                {/* Overdue */}
                <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b border-line-soft px-6 py-4">
                    <h2 className="text-lg font-bold text-ink">Overdue items</h2>
                    <Link to="/librarian/returns" className="text-xs font-semibold text-camel-dark hover:text-ink">
                      Returns →
                    </Link>
                  </div>
                  {overdueLoans.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <p className="mt-3 text-sm font-bold text-ink">No overdue items.</p>
                      <p className="mt-1 text-xs text-muted">Everything is on time.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-line-soft">
                      {overdueLoans.slice(0, 4).map(({ item, book, copy }) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 px-6 py-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-ink">
                              {book?.title ?? `Book #${item.bookCopyId}`}
                            </p>
                            <p className="text-xs text-muted">Copy {copy?.barcode ?? item.bookCopyId}</p>
                          </div>
                          <Badge variant="destructive">Overdue</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Unpaid fines */}
                <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b border-line-soft px-6 py-4">
                    <h2 className="text-lg font-bold text-ink">Unpaid fines</h2>
                    <Link to="/librarian/fines" className="text-xs font-semibold text-camel-dark hover:text-ink">
                      Fines →
                    </Link>
                  </div>
                  {unpaidFines.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-muted">No unpaid fines.</p>
                  ) : (
                    <ul className="divide-y divide-line-soft">
                      {unpaidFines.slice(0, 4).map((fine) => (
                        <li key={fine.id} className="flex items-center justify-between gap-3 px-6 py-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-ink">{fine.type} fine</p>
                            <p className="text-xs text-muted">User #{fine.userId}</p>
                          </div>
                          <p className="shrink-0 text-sm font-extrabold text-red-600">{formatNPR(fine.amount)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}