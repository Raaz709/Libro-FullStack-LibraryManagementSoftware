/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 focus-visible:border-[#FF7138] focus-visible:ring-[3px] focus-visible:ring-[#FF7138]/25 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#FF7138] text-white",

        secondary:
          "border-[#EEEEEA] bg-[#F6F6F2] text-[#202020]",

        destructive:
          "border-red-200 bg-red-50 text-red-600",

        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700",

        outline:
          "border-[#EEEEEA] bg-white text-[#202020]",

        ghost:
          "border-transparent text-[#5F5F5F] hover:bg-[#F6F6F2] hover:text-[#202020]",

        link:
          "border-transparent bg-transparent px-1 text-[#FF7138] underline-offset-4 hover:underline",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
