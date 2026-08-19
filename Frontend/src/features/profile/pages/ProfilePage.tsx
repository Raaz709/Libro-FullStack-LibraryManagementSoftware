import { Link } from "react-router-dom";
import { Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Member";
  const avatarInitial = user?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl animate-in fade-in duration-500">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          <div className="relative h-28 bg-gradient-to-r from-camel to-camel-dark">
            <div className="absolute -bottom-10 left-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-cream text-2xl font-extrabold text-ink shadow-md">
              {avatarInitial}
            </div>
          </div>

          <div className="px-8 pb-8 pt-14">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">{displayName}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <Mail className="h-4 w-4" />
                  {user?.email ?? "—"}
                </p>
              </div>
              {user?.role && (
                <Badge className="mt-1">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {user.role}
                </Badge>
              )}
            </div>

            <div className="mt-8 rounded-soft border border-line bg-cream/60 p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-camel-dark">
                Account details
              </p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-camel-dark shadow-sm">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-muted">Email</dt>
                    <dd className="truncate text-sm font-bold text-ink">{user?.email ?? "—"}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-camel-dark shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-muted">Role</dt>
                    <dd className="text-sm font-bold text-ink">{user?.role ?? "—"}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}