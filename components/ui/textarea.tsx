import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-navy-600/50 bg-navy-800/50 px-3 py-2 text-sm text-slate-100 ring-offset-navy-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 focus-visible:border-gold-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
});
Textarea.displayName = "Textarea"

export { Textarea }