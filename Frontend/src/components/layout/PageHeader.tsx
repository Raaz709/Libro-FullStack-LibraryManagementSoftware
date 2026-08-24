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
    <div className={cn("mb-8 pb-6 border-b border-[#FF7138]/20 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-3xl">
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full bg-[#FFF3EE] border border-[#FFE1D2] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#FF7138]">
            {eyebrow}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[#202020] sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-[#5F5F5F]">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
