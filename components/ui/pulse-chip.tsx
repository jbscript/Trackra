import * as React from "react"
import { cn } from "@/lib/utils"

export interface PulseChipProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

const PulseChip = React.forwardRef<HTMLDivElement, PulseChipProps>(
  ({ className, active = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary shadow-none label-sm border-none font-medium",
          className
        )}
        {...props}
      >
        {active && (
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex size-1.5 rounded-full bg-[var(--primary)]" style={{ boxShadow: "0 0 8px 2px var(--primary)" }}></span>
          </span>
        )}
        {children}
      </div>
    )
  }
)
PulseChip.displayName = "PulseChip"

export { PulseChip }
