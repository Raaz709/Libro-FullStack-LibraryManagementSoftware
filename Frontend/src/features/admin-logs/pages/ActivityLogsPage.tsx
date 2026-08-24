import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { MessageBanner } from "@/components/ui/message-banner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  useActivityLogs,
  useDeleteActivityLog,
} from "@/features/admin-logs/hooks/useAdminLogs";
import type { ActivityLog } from "@/types/audit.types";

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function ActivityLogsPage() {
  const { data: logs = [], isLoading, isError, error } = useActivityLogs();
  const deleteLog = useDeleteActivityLog();

  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<ActivityLog | null>(null);
  const [deleting, setDeleting] = useState<ActivityLog | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs
      .filter((log) => {
        if (!q) return true;
        return (
          (log.action ?? "").toLowerCase().includes(q) ||
          (log.details ?? "").toLowerCase().includes(q) ||
          String(log.userId ?? "").includes(q) ||
          (log.ipAddress ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? 0).getTime();
        return bTime - aTime;
      });
  }, [logs, search]);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteLog.mutateAsync(deleting.id);
      setMessage({ text: "Activity log deleted.", kind: "success" });
      setDeleting(null);
    } catch {
      setMessage({ text: "Failed to delete activity log.", kind: "error" });
    }
  };

  return (
    <div className="bg-cream min-h-screen overflow-hidden p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-48 w-48 rounded-full bg-cream/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Admin"
          title="Activity Logs"
          description="A timeline of user actions across the library."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search action, details, user, or IP..."
            aria-label="Search activity logs"
            className="h-9 w-72 text-xs"
          />
        </PageHeader>

        <MessageBanner message={message} />

        <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Loading activity logs...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load activity logs: {(error as Error).message}
            </p>
          ) : filteredLogs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream">
                <FileText className="h-7 w-7 text-camel" />
              </div>
              <p className="mt-4 text-lg font-bold text-ink">No activity logs found.</p>
              <p className="mt-1 text-sm text-muted">
                {search ? "Try adjusting your search." : "No recorded activity yet."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {filteredLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
                    <p className="h-4 w-4 text-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-muted">{log.action ?? "Activity"}</p>
                        {log.userId && (
                          <Badge variant="secondary">User #{log.userId}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted">{formatDateTime(log.createdAt)}</p>
                    </div>
                    {log.details && (
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{log.details}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {log.ipAddress && (
                        <span className="font-mono text-xs text-muted">IP {log.ipAddress}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setViewing(log)}
                        className="text-xs font-semibold text-muted transition-colors hover:text-muted"
                      >
                        View details →
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(log)}
                        className="text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Dialog open={Boolean(viewing)} onOpenChange={(next) => !next && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity log #{viewing?.id}</DialogTitle>
            <DialogDescription>
              {formatDateTime(viewing?.createdAt ?? null)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Action</p>
              <p className="text-sm font-bold text-muted">{viewing?.action ?? "—"}</p>
            </div>
            <div className="grid gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">User</p>
              <p className="text-sm text-muted">{viewing?.userId ? `User #${viewing.userId}` : "System"}</p>
            </div>
            <div className="grid gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Details</p>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-soft bg-cream p-3 text-sm leading-6 text-muted">
                {viewing?.details ?? "—"}
              </pre>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">IP address</p>
                <p className="text-sm text-muted">{viewing?.ipAddress ?? "—"}</p>
              </div>
              <div className="grid gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">User agent</p>
                <p className="break-words text-sm text-muted">{viewing?.userAgent ?? "—"}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this activity log?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes this activity record. This action cannot be undone.
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
