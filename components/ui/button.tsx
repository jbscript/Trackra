"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-primary/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 min-h-[48px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary to-primary-container text-primary-foreground hover:brightness-110 shadow-ambient",
        outline: "border border-white/20 bg-transparent hover:bg-white/5 text-foreground",
        secondary: "border border-white/20 bg-transparent hover:bg-white/5 text-foreground",
        ghost: "hover:bg-white/5 text-foreground",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-8 py-4 rounded-full text-base",
        xs: "h-10 px-4 rounded-full text-sm",
        sm: "h-10 px-6 rounded-full text-sm",
        lg: "h-14 px-10 rounded-full text-lg",
        icon: "size-12 rounded-full",
        "icon-xs": "size-10 rounded-full",
        "icon-sm": "size-10 rounded-full",
        "icon-lg": "size-14 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
