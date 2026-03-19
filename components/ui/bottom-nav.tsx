"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BottomNavItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  active?: boolean;
}

const BottomNavItem = React.forwardRef<HTMLButtonElement, BottomNavItemProps>(
  ({ className, icon, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative flex flex-col items-center justify-center p-4 transition-colors hover:text-foreground text-muted-foreground outline-none",
          active && "text-foreground",
          className
        )}
        {...props}
      >
        <span className="mb-1">{icon}</span>
        {active && (
          <span className="absolute bottom-1.5 size-1.5 rounded-full bg-primary shadow-[0_0_8px_1px_var(--primary)]" />
        )}
      </button>
    )
  }
)
BottomNavItem.displayName = "BottomNavItem"

const BottomNav = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm pointer-events-none">
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-around rounded-[1.5rem] glass border border-white/5 px-2 py-1 shadow-ambient pointer-events-auto",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
BottomNav.displayName = "BottomNav"

export { BottomNav, BottomNavItem }
