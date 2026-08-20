/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:border-camel focus-visible:ring-3 focus-visible:ring-camel/25 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-camel to-camel-dark text-ink shadow-pill hover:-translate-y-0.5 hover:from-camel-dark hover:to-camel-dark hover:shadow-md active:translate-y-0",

        outline:
          "border-line bg-card text-ink shadow-sm hover:-translate-y-0.5 hover:border-camel hover:bg-cream/40 hover:text-camel-dark hover:shadow-sm active:translate-y-0",

        secondary:
          "bg-cream text-ink hover:-translate-y-0.5 hover:bg-camel/25 hover:text-ink hover:shadow-sm active:translate-y-0",

        ghost:
          "text-muted hover:bg-cream hover:text-ink active:bg-cream-deep/60",

        destructive:
          "border-red-200 bg-red-50 text-red-600 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:text-red-700 hover:shadow-sm",

        link:
          "text-camel-dark underline-offset-4 hover:text-ink hover:underline",
      },

      size: {
        default:
          "h-9 gap-1.5 px-4 in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",

        xs:
          "h-7 gap-1 rounded-full px-2.5 text-xs in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-8 gap-1 rounded-full px-3 in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",

        lg:
          "h-11 gap-2 px-6 text-base in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",

        icon:
          "size-9 rounded-full",

        "icon-xs":
          "size-6 rounded-full in-data-[slot=button-group]:rounded-full [&_svg:not([class*='size-'])]:size-3",

        "icon-sm":
          "size-8 rounded-full in-data-[slot=button-group]:rounded-full",

        "icon-lg":
          "size-11 rounded-full",
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