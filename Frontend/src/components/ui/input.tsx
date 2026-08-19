import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-soft border border-line bg-card px-3.5 py-2 text-sm text-ink shadow-sm transition-all duration-200 outline-none placeholder:text-muted/70 hover:border-camel/60 focus-visible:border-camel focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-camel/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-400 aria-invalid:ring-[3px] aria-invalid:ring-red-400/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }