import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all duration-200 focus-visible:border-[#b08a45] focus-visible:ring-[3px] focus-visible:ring-[#b08a45]/20 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-[#1f2937] bg-[#1f2937] text-[#f4f1ea] [a]:hover:bg-[#111827]",

        secondary:
          "border-[#ded8cc] bg-[#e8e3d8] text-[#374151] [a]:hover:bg-[#ded7c9]",

        destructive:
          "border-red-200 bg-red-50 text-red-600 [a]:hover:bg-red-100",

        outline:
          "border-[#d8d3c8] bg-white text-[#374151] [a]:hover:border-[#b08a45] [a]:hover:bg-[#faf9f6] [a]:hover:text-[#735729]",

        ghost:
          "border-transparent text-[#6b7280] hover:bg-[#e8e3d8]/70 hover:text-[#735729]",

        link:
          "border-transparent bg-transparent px-1 text-[#9a773c] underline-offset-4 hover:text-[#735729] hover:underline",
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