import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  CircleDollarSign,
  Heart,
  Bell,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  useMemberDashboard,
  isLoanOverdue,
} from "@/features/dashboard/hooks/useMemberDashboard";
import { Badge } from "@/components/ui/badge";
import { formatNPR } from "@/lib/currency";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
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
      tone: "bg-camel/15 text-camel-dark",
    },
    {
      label: "Unpaid fines",
      value: formatNPR(unpaidTotal),
      to: "/my-fines",
      icon: CircleDollarSign,
      tone: "bg-red-50 text-red-600",
    },
    {
      label: "Favorites",
      value: favoritesCount,
      to: "/favorites",
      icon: Heart,
      tone: "bg-cream text-camel-dark",
    },
    {
      label: "Unread notifications",
      value: unreadCount,
      to: "/notifications",
      icon: Bell,
      tone: "bg-cream text-camel-dark",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-ink/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        {/* Greeting */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-camel text-xl font-extrabold text-ink shadow-sm">
              {avatarInitial}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-camel-dark">
                Welcome back
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink">{displayName}</h1>
            </div>
          </div>
          <p className="rounded-full border border-line bg-card px-4 py-1.5 text-xs font-semibold text-camel-dark">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted">Loading your dashboard...</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">
            Failed to load dashboard: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                    <p className="mt-4 text-2xl font-extrabold tracking-tight text-ink">{stat.value}</p>
                    <p className="mt-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                      {stat.label}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              {/* Current loans */}
              <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-line-soft px-6 py-4">
                  <h2 className="text-lg font-bold text-ink">Your current loans</h2>
                  <Link to="/my-borrowing" className="text-xs font-semibold text-camel-dark hover:text-ink">
                    View all →
                  </Link>
                </div>
                {sortedLoans.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream">
                      <BookOpen className="h-6 w-6 text-camel" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-ink">Nothing borrowed right now.</p>
                    <p className="mt-1 text-xs text-muted">Explore the collection and start reading.</p>
                    <Link to="/books">
                      <span className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-xs font-semibold text-card transition-colors hover:bg-camel-dark">
                        Browse books
                      </span>
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-line-soft">
                    {sortedLoans.map(({ item, book, copy }) => (
                      <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
                          <BookOpen className="h-4 w-4 text-camel-dark" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/books/${copy?.bookId ?? ""}`}
                            className="block truncate text-sm font-bold text-ink hover:text-camel-dark"
                          >
                            {book?.title ?? `Book #${copy?.bookId ?? item.bookCopyId}`}
                          </Link>
                          <p className="text-xs text-muted">Copy {copy?.barcode ?? item.bookCopyId}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-semibold ${isLoanOverdue(item) ? "text-red-600" : "text-muted"}`}>
                            Due {formatDate(item.dueDate)}
                          </p>
                          {isLoanOverdue(item) && (
                            <Badge className="mt-1" variant="destructive">Overdue</Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Unpaid fines */}
              <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-line-soft px-6 py-4">
                  <h2 className="text-lg font-bold text-ink">Unpaid fines</h2>
                  <Link to="/my-fines" className="text-xs font-semibold text-camel-dark hover:text-ink">
                    View all →
                  </Link>
                </div>
                {unpaidFines.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                      <CircleDollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-ink">No outstanding fines.</p>
                    <p className="mt-1 text-xs text-muted">You're in the clear.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-line-soft">
                    {unpaidFines.slice(0, 4).map((fine) => (
                      <li key={fine.id} className="flex items-center justify-between gap-3 px-6 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">{fine.type} fine</p>
                          <p className="truncate text-xs text-muted">{fine.reason ?? "Library fine"}</p>
                        </div>
                        <p className="shrink-0 text-sm font-extrabold text-red-600">{formatNPR(fine.amount)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}