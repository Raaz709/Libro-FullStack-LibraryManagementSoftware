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
        "flex min-h-[90px] w-full rounded-md border border-[#d8d3c8] bg-[#faf9f6] px-3 py-2 text-sm text-[#374151] shadow-sm transition-all duration-200 outline-none placeholder:text-[#aaa59c] hover:border-[#c4bdae] focus-visible:border-[#b08a45] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[#b08a45]/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }