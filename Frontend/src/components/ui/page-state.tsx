import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-line bg-white/60 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream">
        {icon}
      </div>
      <p className="mt-4 text-lg font-bold text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-camel/30 border-t-camel" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-sm font-semibold text-red-600">{message}</p>
    </div>
  );
}