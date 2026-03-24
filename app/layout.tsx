import { Suspense } from "react"
import { Manrope } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

import { BottomNav } from "@/components/layout/bottom-nav"

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark font-sans antialiased", fontSans.variable)}
    >
      <body className="flex h-screen flex-col overflow-hidden bg-surface text-foreground selection:bg-primary/30">
        <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
        <div className="flex shrink-0 items-center justify-center">
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </div>
      </body>
    </html>
  )
}
