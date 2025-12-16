import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-semibold transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:pointer-events-none disabled:opacity-50 data-[state=loading]:cursor-wait",
  {
    variants: {
      variant: {
        default:
          "relative bg-linear-to-b from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 active:scale-95",
        destructive:
          "bg-linear-to-b from-error-500 to-error-600 text-white shadow-md hover:shadow-lg hover:from-error-600 hover:to-error-600 active:scale-95",
        outline:
          "border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 hover:shadow active:scale-95",
        secondary:
          "bg-white border border-neutral-200 text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 hover:shadow active:scale-95",
        ghost: "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95",
        link: "text-primary-500 underline-offset-4 hover:underline hover:text-primary-600",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm rounded-lg",
        lg: "h-14 px-8 py-4 text-lg rounded-lg",
        icon: "h-12 w-12",
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