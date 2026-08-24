import { useMemo, useState } from "react";
import {
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
  useAuditLogs,
  useDeleteAuditLog,
} from "@/features/admin-logs/hooks/useAdminLogs";
import type { AuditLog } from "@/types/audit.types";

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function prettyJson(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export default function AuditLogsPage() {
  const { data: logs = [], isLoading, isError, error } = useAuditLogs();
  const deleteLog = useDeleteAuditLog();

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [viewing, setViewing] = useState<AuditLog | null>(null);
  const [deleting, setDeleting] = useState<AuditLog | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const actions = useMemo(
    () => [...new Set(logs.map((log) => log.action).filter(Boolean))].sort(),
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs
      .filter((log) => {
        const matchesAction = !actionFilter || log.action === actionFilter;
        if (!matchesAction) return false;
        if (!q) return true;
        return (
          log.action.toLowerCase().includes(q) ||
          log.entityType.toLowerCase().includes(q) ||
          String(log.entityId).includes(q) ||
          String(log.userId ?? "").includes(q) ||
          (log.ipAddress ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [logs, search, actionFilter]);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteLog.mutateAsync(deleting.id);
      setMessage({ text: "Audit log deleted.", kind: "success" });
      setDeleting(null);
    } catch {
      setMessage({ text: "Failed to delete audit log.", kind: "error" });
    }
  };

  return (
    <div className="bg-cream min-h-screen p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-48 w-48 rounded-full bg-cream/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Admin"
          title="Audit Logs"
          description="A record of who changed what, and when."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search action, entity, user, or IP..."
            aria-label="Search audit logs"
            className="h-9 w-72 text-xs"
          />
          <Select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            aria-label="Filter by action"
            className="h-9 w-48 text-xs"
          >
            <option value="">All actions</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </Select>
        </PageHeader>

        <MessageBanner message={message} />

        <section className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {isLoading ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Loading audit logs...</p>
          ) : isError ? (
            <p className="px-6 py-16 text-center text-sm text-red-600">
              Failed to load audit logs: {(error as Error).message}
            </p>
          ) : filteredLogs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream">
                <ScrollText className="h-7 w-7 text-camel" />
              </div>
              <p className="mt-4 text-lg font-bold text-ink">No audit logs found.</p>
              <p className="mt-1 text-sm text-muted">
                {search || actionFilter ? "Try adjusting filters." : "No recorded changes yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-cream/50 text-xs uppercase tracking-[0.12em] text-muted">
                    <th className="px-6 py-3 font-semibold">When</th>
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Action</th>
                    <th className="px-6 py-3 font-semibold">Entity</th>
                    <th className="px-6 py-3 font-semibold">IP</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-cream/40">
                      <td className="whitespace-nowrap px-6 py-4 text-muted">{formatDateTime(log.createdAt)}</td>
                      <td className="px-6 py-4 text-muted">{log.userId ? `#${log.userId}` : "System"}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{log.action || "—"}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted">
                        <span className="font-semibold capitalize">{log.entityType}</span>
                        <span className="ml-1.5 font-mono text-xs text-muted">#{log.entityId}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted">{log.ipAddress ?? "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="xs" onClick={() => setViewing(log)}>
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          className="ml-2 text-red-600 hover:text-red-600"
                          onClick={() => setDeleting(log)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialog open={Boolean(viewing)} onOpenChange={(next) => !next && setViewing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Audit log #{viewing?.id}</DialogTitle>
            <DialogDescription>
              {viewing?.action} on {viewing?.entityType} #{viewing?.entityId} · {formatDateTime(viewing?.createdAt ?? "")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">User</p>
              <p className="text-sm text-muted">{viewing?.userId ? `User #${viewing.userId}` : "System"}</p>
            </div>
            <div className="grid gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">IP address</p>
              <p className="text-sm text-muted">{viewing?.ipAddress ?? "—"}</p>
            </div>
            <div className="grid gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">User agent</p>
              <p className="break-words text-sm text-muted">{viewing?.userAgent ?? "—"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">Old values</p>
                <pre className="max-h-56 overflow-auto rounded-soft bg-cream p-3 text-xs leading-5 text-muted">
                  {prettyJson(viewing?.oldValues)}
                </pre>
              </div>
              <div className="grid gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camel-dark">New values</p>
                <pre className="max-h-56 overflow-auto rounded-soft bg-cream p-3 text-xs leading-5 text-muted">
                  {prettyJson(viewing?.newValues)}
                </pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this audit log?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the record of this change. This action cannot be undone.
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