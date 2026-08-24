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
    <section className={cn("overflow-hidden rounded-[24px] border border-[#EEEEEA] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.06)] transition-all duration-200 hover:border-[#FF7138]/40", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-[#EEEEEA] bg-[#F6F6F2]/60 px-6 py-4">
        <h2 className="flex items-center gap-2.5 text-base font-bold tracking-tight text-[#202020]">
          <span className="h-2 w-2 rounded-full bg-[#FF7138]" />
          {title}
        </h2>
        {linkTo && (
          <Link to={linkTo} className="text-xs font-semibold text-[#FF7138] transition-colors hover:text-[#202020]">
            {linkLabel} →
          </Link>
        )}
      </div>
      <div className={cn("px-6 py-4", bodyClassName)}>{children}</div>
    </section>
  );
}
