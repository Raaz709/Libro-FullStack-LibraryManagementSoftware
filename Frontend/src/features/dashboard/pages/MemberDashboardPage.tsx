import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  CircleDollarSign,
  Heart,
  Bell,
  BookOpen,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  useMemberDashboard,
  isLoanOverdue,
} from "@/features/dashboard/hooks/useMemberDashboard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Panel } from "@/components/ui/panel";
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

export default function MemberDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId;
  const {
    currentLoans,
    unpaidTotal,
    unpaidFines,
    favoritesCount,
    unreadCount,
    isLoading,
    isError,
    error,
  } = useMemberDashboard(userId);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "there";
  const avatarInitial = user?.firstName?.charAt(0).toUpperCase() ?? "?";

  const sortedLoans = [...currentLoans].sort(
    (a, b) => new Date(a.item.dueDate).getTime() - new Date(b.item.dueDate).getTime(),
  );

  const stats = [
    {
      label: "Currently borrowed",
      value: currentLoans.length,
      to: "/my-borrowing",
      icon: ArrowLeftRight,
      tone: "orange" as const,
    },
    {
      label: "Unpaid fines",
      value: formatNPR(unpaidTotal),
      to: "/my-fines",
      icon: CircleDollarSign,
      tone: "red" as const,
    },
    {
      label: "Favorites",
      value: favoritesCount,
      to: "/favorites",
      icon: Heart,
      tone: "indigo" as const,
    },
    {
      label: "Unread notifications",
      value: unreadCount,
      to: "/notifications",
      icon: Bell,
      tone: "indigo" as const,
    },
  ];

  return (
    <div className="bg-cream min-h-screen p-6 lg:p-8">
      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        {/* Greeting */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-cream text-slate-600">
              {avatarInitial}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Welcome back
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-ink">
                {displayName}
              </h1>
            </div>
          </div>
          <div className="rounded-lg border border-line p-2 shadow-sm hover:bg-cream transition-colors">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Loading your dashboard..." />
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">
            Failed to load dashboard: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              {/* Current loans */}
              <Panel title="Your current loans" linkTo="/my-borrowing" bodyClassName="p-0 py-0">
                {sortedLoans.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cream border border-line">
                      <BookOpen className="h-6 w-6 text-camel" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-ink">Nothing borrowed right now.</p>
                    <p className="mt-1 text-sm text-muted">
                      Explore the collection and start reading.
                    </p>
                    <Link to="/books">
                      <span className="inline-block rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:text-ink transition-colors">
                        Browse books
                      </span>
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-border divide-slate-200">
                    {sortedLoans.map(({ item, book, copy }) => (
                      <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream border border-line">
                          <BookOpen className="h-4 w-4 text-camel" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/books/${copy?.bookId ?? ""}`}
                            className="block truncate text-sm font-bold text-ink transition-colors hover:text-camel-dark">
                            {book?.title ?? `Book #${copy?.bookId ?? item.bookCopyId}`}
                          </Link>
                          <p className="text-xs text-muted">Copy {copy?.barcode ?? item.bookCopyId}</p>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-xs font-semibold", isLoanOverdue(item) && "text-red-600")}>
                            Due {formatDate(item.dueDate)}
                          </p>
                          {isLoanOverdue(item) && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              {/* Unpaid fines */}
              <Panel title="Unpaid fines" linkTo="/my-fines" bodyClassName="p-0 py-0">
                {unpaidFines.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cream border border-line">
                      <CircleDollarSign className="h-6 w-6 text-red-500" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-ink">No outstanding fines.</p>
                    <p className="mt-1 text-sm text-muted">You're in the clear.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border divide-slate-200">
                    {unpaidFines.slice(0, 4).map((fine) => (
                      <li key={fine.id} className="flex items-center justify-between gap-3 px-6 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">{fine.type} fine</p>
                          <p className="truncate text-xs text-muted">{fine.reason ?? "Library fine"}</p>
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