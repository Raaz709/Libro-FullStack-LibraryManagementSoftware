import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  linkTo,
  linkLabel = "View all",
  children,
  className,
  bodyClassName,
}: {
  title: string;
  linkTo?: string;
  linkLabel?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-card border border-line bg-card shadow-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line-soft bg-gradient-to-r from-cream/60 to-transparent px-6 py-4">
        <h2 className="flex items-center gap-2.5 text-base font-bold tracking-tight text-ink">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-camel to-camel-dark" />
          {title}
        </h2>
        {linkTo && (
          <Link to={linkTo} className="text-xs font-semibold text-camel-dark transition-colors hover:text-ink">
            {linkLabel} →
          </Link>
        )}
      </div>
      <div className={cn("px-6 py-4", bodyClassName)}>{children}</div>
    </section>
  );
}