import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-navy-700 to-navy-800 text-gold-100 shadow-lg hover:from-navy-600 hover:to-navy-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 border border-navy-600/50",
        primary:
          "gold-button",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-500 hover:to-red-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 border border-red-500/50",
        outline:
          "border border-navy-600/50 bg-navy-800/50 text-slate-300 shadow-sm hover:bg-navy-700/50 hover:text-gold-100 hover:border-gold-500/50",
        secondary:
          "bg-gradient-to-r from-navy-700 to-navy-800 text-slate-200 shadow-md hover:from-navy-600 hover:to-navy-700 hover:text-gold-100 border border-navy-600/50",
        ghost: 
          "text-slate-300 hover:bg-navy-800/50 hover:text-gold-100",
        link: 
          "text-gold-400 underline-offset-4 hover:underline hover:text-gold-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
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