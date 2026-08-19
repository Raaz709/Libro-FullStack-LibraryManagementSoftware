import { useMemo, useState } from "react";
import { Bell, CheckCheck, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "@/features/notifications/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Notification } from "@/types/notifications.types";

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function TypeIcon({ type }: { type: string }) {
  const normalized = type.toLowerCase();
  const props = { className: "h-4 w-4", "aria-hidden": true };
  if (normalized.includes("due") || normalized.includes("overdue") || normalized.includes("return")) {
    return <Clock {...props} className="h-4 w-4 text-red-600" />;
  }
  if (normalized.includes("warn") || normalized.includes("alert") || normalized.includes("fine")) {
    return <AlertTriangle {...props} className="h-4 w-4 text-amber-600" />;
  }
  if (normalized.includes("success") || normalized.includes("paid")) {
    return <CheckCircle2 {...props} className="h-4 w-4 text-emerald-600" />;
  }
  return <Bell {...props} className="h-4 w-4 text-camel-dark" />;
}

const typeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Info: "secondary",
  Warning: "outline",
  Due: "destructive",
  Success: "secondary",
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, error } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const filtered = useMemo(() => {
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return filter === "unread" ? sorted.filter((notification) => !notification.isRead) : sorted;
  }, [notifications, filter]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl animate-in fade-in duration-500">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-1 w-10 bg-camel" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-camel-dark">Library</p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink">Notifications</h1>
            <p className="mt-1 text-sm text-muted">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.` : "You're all caught up."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            onClick={() => markAllAsRead.mutateAsync()}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            {markAllAsRead.isPending ? "Marking..." : "Mark all as read"}
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "unread"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                filter === option
                  ? "bg-ink text-card"
                  : "bg-card text-muted hover:bg-cream-deep hover:text-ink"
              }`}
            >
              {option}
              {option === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-camel px-1.5 text-[10px] font-bold text-ink">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted">Loading notifications...</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">
            Failed to load notifications: {(error as Error).message}
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-white/60 px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream">
              <Bell className="h-7 w-7 text-camel" />
            </div>
            <p className="mt-4 text-lg font-bold text-ink">
              {filter === "unread" ? "No unread notifications." : "No notifications yet."}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Updates about your loans, dues, and library activity will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={() => markAsRead.mutate(notification.id)}
                isMarking={markAsRead.isPending}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: Notification;
  onMarkRead: () => void;
  isMarking: boolean;
}) {
  return (
    <li
      className={`flex items-start gap-4 rounded-card border p-5 transition-colors ${
        notification.isRead
          ? "border-line bg-card"
          : "border-camel/50 bg-card shadow-[0_12px_35px_-18px_rgba(154,119,60,0.35)]"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
        <TypeIcon type={notification.type} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold text-ink ${notification.isRead ? "font-semibold text-ink/70" : ""}`}>
              {notification.title}
            </p>
            {!notification.isRead && <span className="h-2 w-2 rounded-full bg-camel" aria-label="Unread" />}
          </div>
          <p className="text-xs text-muted">{formatRelativeTime(notification.createdAt)}</p>
        </div>
        <p className={`mt-1 text-sm leading-6 ${notification.isRead ? "text-muted" : "text-ink/80"}`}>
          {notification.message}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Badge variant={typeVariant[notification.type] ?? "secondary"}>{notification.type}</Badge>
          {!notification.isRead && (
            <button
              type="button"
              onClick={onMarkRead}
              disabled={isMarking}
              className="text-xs font-semibold text-camel-dark transition-colors hover:text-ink disabled:opacity-50"
            >
              {isMarking ? "Marking..." : "Mark as read"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}