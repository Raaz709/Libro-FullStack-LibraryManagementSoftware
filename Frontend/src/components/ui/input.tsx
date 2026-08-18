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
        "h-10 w-full min-w-0 rounded-md border border-[#d8d3c8] bg-[#faf9f6] px-3 py-2 text-sm text-[#374151] shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#374151] placeholder:text-[#aaa59c] hover:border-[#c4bdae] focus-visible:border-[#b08a45] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[#b08a45]/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-400 aria-invalid:ring-[3px] aria-invalid:ring-red-400/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }