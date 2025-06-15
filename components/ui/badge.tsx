import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-navy-500/10 text-navy-300 border-navy-500/30",
        secondary:
          "border-transparent bg-slate-500/10 text-slate-300 border-slate-500/30",
        destructive:
          "border-transparent bg-red-500/10 text-red-300 border-red-500/30",
        outline: 
          "text-slate-200 border-navy-600/50",
        success:
          "border-transparent bg-green-500/10 text-green-300 border-green-500/30",
        warning:
          "border-transparent bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }