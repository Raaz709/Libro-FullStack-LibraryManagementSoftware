import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "camel" | "red" | "green" | "ink" | "indigo";

const TONE_CLASSES: Record<Tone, string> = {
  camel: "bg-gradient-to-br from-camel/30 to-camel/10 text-camel-dark ring-camel/20",
  indigo: "bg-camel/15 text-camel-dark ring-indigo-200/60",
  red: "bg-gradient-to-br from-red-100 to-red-50 text-red-600 ring-red-200/60",
  green: "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 ring-emerald-200/60",
  ink: "bg-gradient-to-br from-cream-deep to-cream text-camel-dark ring-line",
};

export function StatCard({
  label,
  value,
  to,
  icon: Icon,
  tone = "camel",
}: {
  label: string;
  value: ReactNode;
  to: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-card border border-line bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-camel hover:shadow-card-hover"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-camel/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl ring-1", TONE_CLASSES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-camel-dark" />
      </div>
      <p className="mt-4 truncate text-2xl font-extrabold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
    </Link>
  );
}