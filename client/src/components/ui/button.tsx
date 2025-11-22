import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
/* eslint-disable react-refresh/only-export-components */
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
        secondary:
          "bg-gray-200 text-gray-900 hover:bg-gray-300",
        ghost: "hover:bg-gray-100 text-gray-900",
        link: "text-blue-600 underline-offset-4 hover:text-blue-700",
        luxury: "bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg",
        gold: "relative overflow-hidden bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 text-slate-900 shadow-lg hover:scale-105 active:scale-100 before:pointer-events-none before:absolute before:inset-0 before:-left-full before:h-full before:w-1/2 before:-skew-x-12 before:bg-white/25 before:opacity-0 before:transition-all before:duration-700 hover:before:left-full hover:before:opacity-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }