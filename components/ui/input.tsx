import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref): React.ReactElement => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg glass px-4 py-2.5 text-sm text-foreground",
          "placeholder:text-neutral-500",
          "transition-all duration-200",
          "focus:outline-hidden focus:border-primary-500/50 focus:shadow-glow-sm",
          "hover:border-neutral-700",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
