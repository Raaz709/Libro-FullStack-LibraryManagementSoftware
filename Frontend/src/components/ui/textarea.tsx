import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[90px] w-full rounded-soft border border-line bg-card px-3.5 py-2.5 text-sm text-ink shadow-sm transition-all duration-200 outline-none placeholder:text-muted/70 hover:border-camel/60 focus-visible:border-camel focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-camel/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }