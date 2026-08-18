import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:border-[#b08a45] focus-visible:ring-3 focus-visible:ring-[#b08a45]/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#1f2937] text-[#f4f1ea] shadow-sm hover:-translate-y-0.5 hover:bg-[#111827] hover:shadow-md active:translate-y-0",

        outline:
          "border-[#d8d3c8] bg-white text-[#374151] shadow-sm hover:-translate-y-0.5 hover:border-[#b08a45] hover:bg-[#faf9f6] hover:text-[#735729] hover:shadow-sm active:translate-y-0",

        secondary:
          "bg-[#e8e3d8] text-[#374151] hover:-translate-y-0.5 hover:bg-[#ded7c9] hover:text-[#1f2937] hover:shadow-sm active:translate-y-0",

        ghost:
          "text-[#4b5563] hover:bg-[#e8e3d8]/70 hover:text-[#735729] active:bg-[#e8e3d8]",

        destructive:
          "border-red-200 bg-red-50 text-red-600 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:text-red-700 hover:shadow-sm",

        link:
          "text-[#9a773c] underline-offset-4 hover:text-[#735729] hover:underline",
      },

      size: {
        default:
          "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",

        xs:
          "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",

        lg:
          "h-10 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",

        icon:
          "size-9",

        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",

        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",

        "icon-lg":
          "size-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        })
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants } 