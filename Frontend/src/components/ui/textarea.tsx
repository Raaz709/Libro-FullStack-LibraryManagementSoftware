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
        "flex min-h-[90px] w-full rounded-xl border border-[#EEEEEA] bg-white px-3.5 py-2.5 text-sm text-[#202020] shadow-sm transition-all duration-200 outline-none placeholder:text-[#8C8C8C] hover:border-[#FF7138]/60 focus-visible:border-[#FF7138] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[#FF7138]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
