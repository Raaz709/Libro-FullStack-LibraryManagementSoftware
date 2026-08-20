import { useMemo } from "react";
import {
  BookOpen,
  Library,
  CheckCircle2,
  ArrowLeftRight,
  AlertTriangle,
  CircleDollarSign,
} from "lucide-react";
import { useBorrowRows, isOverdue } from "@/features/borrowing/hooks/useBorrowRows";
import { useFines } from "@/features/fines/hooks/useFines";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { bookCopiesApi } from "@/api/bookCopies.api";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Panel } from "@/components/ui/panel";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/ui/page-state";
import { formatNPR } from "@/lib/currency";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function LibrarianDashboardPage() {
  const { rows, isLoading, isError, error } = useBorrowRows();
  const { data: fines = [] } = useFines();

  const { data: books = [] } = useQuery({
    queryKey: ["books", "all"],
    queryFn: () => booksApi.getAll({ page: 1, pageSize: 100 }).then((result) => result.items),
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
      tone: "camel" as const,
    },
    {
      label: "Copies",
      value: copies.length,
      to: "/librarian/copies",
      icon: Library,
      tone: "ink" as const,
    },
    {
      label: "Available copies",
      value: availableCopies,
      to: "/librarian/copies",
      icon: CheckCircle2,
      tone: "green" as const,
    },
    {
      label: "Active loans",
      value: activeLoans.length,
      to: "/librarian/borrowing",
      icon: ArrowLeftRight,
      tone: "camel" as const,
    },
    {
      label: "Overdue",
      value: overdueLoans.length,
      to: "/librarian/returns",
      icon: AlertTriangle,
      tone: "red" as const,
    },
    {
      label: "Unpaid fines",
      value: formatNPR(unpaidTotal),
      to: "/librarian/fines",
      icon: CircleDollarSign,
      tone: "red" as const,
    },
  ];

  return (
    <div className="page-ambient min-h-screen p-6 lg:p-8">
      <div className="relative mx-auto max-w-7xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Librarian"
          title="Dashboard"
          description="Library operations at a glance."
        />

        {isLoading ? (
          <LoadingState label="Loading dashboard..." />
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">
            Failed to load dashboard: {(error as Error).message}
          </p>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              {/* Recent loans */}
              <Panel title="Recent loans" linkTo="/librarian/borrowing" linkLabel="Manage borrowing" bodyClassName="p-0 py-0">
                {recentLoans.length === 0 ? (
                  <p className="px-6 py-12 text-center text-sm text-muted">No loans yet.</p>
                ) : (
                  <ul className="divide-y divide-line-soft">
                    {recentLoans.map(({ item, user, book, copy }) => (
                      <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-camel/30 to-camel/10 text-camel-dark">
                          <BookOpen className="h-4 w-4" />
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
              </Panel>

              <div className="space-y-6">
                {/* Overdue */}
                <Panel title="Overdue items" linkTo="/librarian/returns" linkLabel="Returns" bodyClassName="p-0 py-0">
                  {overdueLoans.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
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
                </Panel>

                {/* Unpaid fines */}
                <Panel title="Unpaid fines" linkTo="/librarian/fines" linkLabel="Fines" bodyClassName="p-0 py-0">
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
                </Panel>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}