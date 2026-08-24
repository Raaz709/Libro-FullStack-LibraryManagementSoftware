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
        "h-10 w-full min-w-0 rounded-xl border border-[#EEEEEA] bg-white px-3.5 py-2 text-sm text-[#202020] shadow-sm transition-all duration-200 outline-none placeholder:text-[#8C8C8C] hover:border-[#FF7138]/60 focus-visible:border-[#FF7138] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[#FF7138]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-[3px] aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
