/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 focus-visible:border-camel focus-visible:ring-[3px] focus-visible:ring-camel/25 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-ink bg-ink text-card [a]:hover:bg-camel-dark",

        secondary:
          "border-line bg-cream text-ink [a]:hover:bg-cream-deep",

        destructive:
          "border-red-200 bg-red-50 text-red-600 [a]:hover:bg-red-100",

        outline:
          "border-line bg-card text-ink [a]:hover:border-camel [a]:hover:bg-cream/40 [a]:hover:text-camel-dark",

        ghost:
          "border-transparent text-muted hover:bg-cream hover:text-ink",

        link:
          "border-transparent bg-transparent px-1 text-camel-dark underline-offset-4 hover:text-ink hover:underline",
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