"use client"

import { Activity, LayoutGrid, PieChart, Plus, User } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isAdding = searchParams.get("add") === "true"
  const isEditing = searchParams.get("id") != null

  if (isAdding || isEditing) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-[2.5rem] border border-outline-variant glass px-3 py-3 shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
      <Link
        href="/"
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-on-surface-variant"
        )}
      >
        <LayoutGrid className="h-[1.35rem] w-[1.35rem]" />
        {pathname === "/" && (
          <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
        )}
      </Link>
      <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary">
        <Activity className="h-[1.35rem] w-[1.35rem]" />
      </button>
      <Link
        href="/transactions?add=true"
        className="mx-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(92,253,128,0.4)] transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </Link>
      <Link
        href="/transactions"
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:text-primary",
          pathname.startsWith("/transactions")
            ? "text-primary"
            : "text-on-surface-variant"
        )}
      >
        <PieChart className="h-[1.35rem] w-[1.35rem]" />
        {pathname.startsWith("/transactions") && (
          <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
        )}
      </Link>
      <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary">
        <User className="h-[1.35rem] w-[1.35rem]" />
      </button>
    </div>
  )
}
