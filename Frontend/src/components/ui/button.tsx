/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:border-[#FF7138] focus-visible:ring-3 focus-visible:ring-[#FF7138]/25 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF7138] text-white shadow-[0_4px_14px_rgba(255,113,56,0.3)] hover:-translate-y-0.5 hover:bg-[#E05D26] hover:shadow-[0_6px_20px_rgba(255,113,56,0.4)] active:translate-y-0",

        outline:
          "border-[#EEEEEA] bg-white text-[#202020] shadow-sm hover:-translate-y-0.5 hover:border-[#FF7138] hover:bg-[#FFF3EE] hover:text-[#FF7138] hover:shadow-sm active:translate-y-0",

        secondary:
          "bg-[#F6F6F2] text-[#202020] hover:-translate-y-0.5 hover:bg-[#FFE1D2] hover:text-[#202020] hover:shadow-sm active:translate-y-0",

        ghost:
          "text-[#5F5F5F] hover:bg-[#F6F6F2] hover:text-[#202020] active:bg-[#EEEEEA]",

        destructive:
          "border-red-200 bg-red-50 text-red-600 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:text-red-700 hover:shadow-sm",

        link:
          "text-[#FF7138] underline-offset-4 hover:text-[#202020] hover:underline",
      },

      size: {
        default:
          "h-10 gap-1.5 px-4 in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",

        xs:
          "h-7 gap-1 rounded-lg px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-8 gap-1 rounded-lg px-3 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",

        lg:
          "h-11 gap-2 px-6 text-base in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",

        icon:
          "size-10 rounded-xl",

        "icon-xs":
          "size-6 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",

        "icon-sm":
          "size-8 rounded-lg in-data-[slot=button-group]:rounded-lg",

        "icon-lg":
          "size-11 rounded-xl",
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
