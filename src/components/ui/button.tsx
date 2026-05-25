import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "destructive"; size?: "sm" | "default" | "lg" }>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants: Record<string, string> = {
    default: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
    outline: "border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800",
    ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }
  const sizes: Record<string, string> = {
    sm: "h-9 px-3 text-sm",
    default: "h-11 px-6 text-sm",
    lg: "h-12 px-8 text-base",
  }
  return (
    <button
      className={cn("inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer", variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
