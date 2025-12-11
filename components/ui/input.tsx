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
          "flex h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus-visible:outline-none hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50",
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