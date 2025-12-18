import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=loading]:cursor-wait",
  {
    variants: {
      variant: {
        default:
          "relative bg-gradient-to-b from-primary-500 to-primary-600 text-primary-foreground shadow-lg hover:shadow-glow hover:from-primary-400 hover:to-primary-500 active:scale-[0.98] focus-visible:shadow-glow",
        destructive:
          "bg-gradient-to-b from-error-500 to-error-600 text-white shadow-lg hover:from-error-400 hover:to-error-500 hover:shadow-[0_0_20px_-4px_rgba(255,59,92,0.4)] active:scale-[0.98]",
        outline:
          "border border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800/50 hover:border-neutral-600 hover:text-foreground active:scale-[0.98]",
        secondary:
          "glass text-neutral-300 hover:text-foreground hover:border-primary-500/30 active:scale-[0.98]",
        ghost:
          "text-neutral-400 hover:text-foreground hover:bg-neutral-800/50 active:scale-[0.98]",
        link:
          "text-primary-500 underline-offset-4 hover:underline hover:text-primary-400",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5 py-2 text-xs rounded-lg",
        lg: "h-12 px-6 py-3 text-base rounded-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  className?: string
  variant?: NonNullable<VariantProps<typeof buttonVariants>["variant"]>
  size?: NonNullable<VariantProps<typeof buttonVariants>["size"]>
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, ...props }: ButtonProps,
    ref: React.Ref<HTMLButtonElement>
  ): React.ReactElement => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
