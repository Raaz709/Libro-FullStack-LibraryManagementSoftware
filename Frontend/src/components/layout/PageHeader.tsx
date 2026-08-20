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
      <div className="max-w-3xl">
        <div className="mb-2.5 flex items-center gap-3">
          <span className="h-[3px] w-9 rounded-full bg-gradient-to-r from-camel to-camel-dark" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-camel-dark">
            {eyebrow}
          </p>
        </div>
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}