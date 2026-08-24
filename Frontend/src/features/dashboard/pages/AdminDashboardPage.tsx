import { useMemo } from "react";
import {
  BookOpen,
  Library,
  CheckCircle2,
  ArrowLeftRight,
  AlertTriangle,
  CircleDollarSign,
  Users,
  ScrollText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { bookCopiesApi } from "@/api/bookCopies.api";
import { usersApi } from "@/api/users.api";
import { auditApi } from "@/api/audit.api";
import { useBorrowRows, isOverdue } from "@/features/borrowing/hooks/useBorrowRows";
import { useFines } from "@/features/fines/hooks/useFines";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Panel } from "@/components/ui/panel";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/ui/page-state";
import { formatNPR } from "@/lib/currency";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminDashboardPage() {
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
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
    retry: false,
  });
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: auditApi.getAuditLogs,
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

  const recentAuditLogs = useMemo(
    () =>
      [...auditLogs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [auditLogs],
  );

  const stats = [
    {
      label: "Users",
      value: users.length,
      to: "/admin/users",
      icon: Users,
      tone: "orange" as const,
    },
    {
      label: "Total books",
      value: books.length,
      to: "/admin/books",
      icon: BookOpen,
      tone: "indigo" as const,
    },
    {
      label: "Copies",
      value: copies.length,
      to: "/admin/copies",
      icon: Library,
      tone: "indigo" as const,
    },
    {
      label: "Available copies",
      value: availableCopies,
      to: "/admin/copies",
      icon: CheckCircle2,
      tone: "green" as const,
    },
    {
      label: "Active loans",
      value: activeLoans.length,
      to: "/admin/borrowing",
      icon: ArrowLeftRight,
      tone: "indigo" as const,
    },
    {
      label: "Overdue",
      value: overdueLoans.length,
      to: "/admin/returns",
      icon: AlertTriangle,
      tone: "red" as const,
    },
    {
      label: "Unpaid fines",
      value: formatNPR(unpaidTotal),
      to: "/admin/fines",
      icon: CircleDollarSign,
      tone: "red" as const,
    },
    {
      label: "Audit logs",
      value: auditLogs.length,
      to: "/admin/audit-logs",
      icon: ScrollText,
      tone: "indigo" as const,
    },
  ];

  return (
    <div className="bg-cream min-h-screen p-6 lg:p-8">
      <div className="relative mx-auto max-w-7xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Admin"
          title="Dashboard"
          description="System-wide overview of the library."
        />

        {isLoading ? (
          <LoadingState label="Loading dashboard..." />
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">
            Failed to load dashboard: {(error as Error).message}
          </p>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Recent loans" linkTo="/admin/borrowing" linkLabel="Manage borrowing" bodyClassName="p-0 py-0">
                {recentLoans.length === 0 ? (
                  <p className="px-6 py-12 text-center text-muted">
                    No loans yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border divide-slate-200">
                    {recentLoans.map(({ item, user, book, copy }) => (
                      <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream border border-line">
                          <BookOpen className="h-4 w-4 text-camel" />
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
                        <p className={cn("shrink-0 text-xs font-semibold", isOverdue(item) && "text-red-600")}>
                          Due {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel title="Latest audit activity" linkTo="/admin/audit-logs" linkLabel="All logs" bodyClassName="p-0 py-0">
                {recentAuditLogs.length === 0 ? (
                  <p className="px-6 py-12 text-center text-muted">
                    No audit logs yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border divide-slate-200">
                    {recentAuditLogs.map((log) => (
                      <li key={log.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream border border-line">
                          <ScrollText className="h-4 w-4 text-camel" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-ink">{log.action || "Activity"}</p>
                          <p className="text-xs text-muted">
                            {log.entityType} #{log.entityId}
                            {log.userId ? ` · User #${log.userId}` : " · System"}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs text-muted">{formatDateTime(log.createdAt)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Panel title="Overdue items" linkTo="/admin/returns" linkLabel="Returns" bodyClassName="p-0 py-0">
                {overdueLoans.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cream border border-line">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-ink">No overdue items.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border divide-slate-200">
                    {overdueLoans.slice(0, 4).map(({ item, book, copy }) => (
                      <li key={item.id} className="flex items-center gap-4 px-6 py-4">
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

              <Panel title="Unpaid fines" linkTo="/admin/fines" linkLabel="Fines" bodyClassName="p-0 py-0">
                {unpaidFines.length === 0 ? (
                  <p className="px-6 py-10 text-center text-muted">
                    No unpaid fines.
                  </p>
                ) : (
                  <ul className="divide-y divide-border divide-slate-200">
                    {unpaidFines.slice(0, 4).map((fine) => (
                      <li key={fine.id} className="flex items-center justify-between gap-3 px-6 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">{fine.type} fine</p>
                          <p className="text-xs text-muted">User #{fine.userId}</p>
                        </div>
                        <p className={cn("shrink-0 text-sm font-extrabold", "text-red-600")}>
                          {formatNPR(fine.amount)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}