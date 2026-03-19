import { Manrope } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

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
      <body>{children}</body>
    </html>
  )
}
