"use client"

import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-outline-variant bg-surface/80 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md items-center justify-between md:max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-surface-container-highest shadow-ambient">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Atelier&backgroundColor=131313"
              alt="User"
            />
          </div>
          <div>
            <p className="label-sm tracking-wider text-on-surface-variant uppercase">
              Welcome Back
            </p>
            <h2 className="text-base font-bold text-primary">Atelier</h2>
          </div>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-container transition-colors hover:bg-surface-container-highest">
          <Bell className="h-5 w-5 text-primary" />
          <span className="absolute top-2 right-2 h-2 w-2 animate-pulse rounded-full bg-primary"></span>
        </button>
      </div>
    </header>
  )
}
