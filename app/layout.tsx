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
      <body className="min-h-screen bg-surface text-foreground selection:bg-primary/30">
        <main className="pt-6 pb-32">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
