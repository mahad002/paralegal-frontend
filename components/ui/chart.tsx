"use client"

import * as React from "react"
import { Tooltip, TooltipProps } from 'recharts'

import { cn } from "@/lib/utils"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: {
    [key: string]: {
      label: string
      color: string
    }
  }
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        {children}
        <div className="flex items-center space-x-4">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: value.color }}
              />
              <span className="text-sm text-muted-foreground">
                {value.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps extends React.ComponentPropsWithoutRef<typeof Tooltip> {
  content?: React.ReactNode
}

const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ content, ...props }, ref) => {
    return <Tooltip content={content} {...props} wrapperStyle={{ outline: 'none' }} />
  }
)
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps extends TooltipProps<number, string> {
  className?: string
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, label, className }, ref) => {
    if (active && payload && payload.length) {
      return (
        <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-sm", className)}>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {label}
              </span>
              <span className="font-bold text-muted-foreground">
                {payload[0].value}
              </span>
            </div>
            {payload.length > 1 && (
              <div className="flex flex-col">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                  Change
                </span>
                <span className="font-bold text-muted-foreground">
                  {payload[1].value}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }