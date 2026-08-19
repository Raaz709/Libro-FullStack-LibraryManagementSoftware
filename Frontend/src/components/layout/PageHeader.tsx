import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="h-1 w-10 bg-camel" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-camel-dark">
            {eyebrow}
          </p>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}