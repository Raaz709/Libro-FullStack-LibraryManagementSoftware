import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "camel" | "red" | "green" | "ink" | "indigo" | "orange";

const TONE_CLASSES: Record<Tone, string> = {
  orange: "bg-white/20 text-white ring-white/30",
  camel: "bg-[#FFE1D2] text-[#FF7138] ring-[#FF7138]/20",
  indigo: "bg-[#FFE1D2] text-[#FF7138] ring-[#FF7138]/20",
  red: "bg-red-100 text-red-600 ring-red-200/60",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200/60",
  ink: "bg-[#F6F6F2] text-[#202020] ring-[#EEEEEA]",
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
  const isOrange = tone === "orange";

  return (
    <Link
      to={to}
      className={cn(
        "group relative overflow-hidden rounded-[24px] border p-6 transition-all duration-300 hover:-translate-y-1",
        isOrange
          ? "bg-[#FF7138] border-[#FF7138] text-white shadow-[0_8px_30px_rgba(255,113,56,0.3)]"
          : "bg-white border-[#EEEEEA] text-[#202020] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:border-[#FF7138] hover:shadow-[0_8px_30px_rgba(255,113,56,0.12)]"
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#FF7138]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl ring-1", TONE_CLASSES[tone])}>
          <Icon className="h-6 w-6" />
        </div>
        <ArrowRight className={cn("h-4 w-4 transition-all duration-200 group-hover:translate-x-1", isOrange ? "text-white/70 group-hover:text-white" : "text-[#8C8C8C] group-hover:text-[#FF7138]")} />
      </div>
      <p className={cn("mt-4 truncate text-3xl font-extrabold tracking-tight", isOrange ? "text-white" : "text-[#202020]")}>{value}</p>
      <p className={cn("mt-1 text-xs font-semibold uppercase tracking-[0.12em]", isOrange ? "text-white/80" : "text-[#5F5F5F]")}>
        {label}
      </p>
    </Link>
  );
}
