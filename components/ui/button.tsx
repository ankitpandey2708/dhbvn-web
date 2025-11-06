import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[state=loading]:cursor-wait b-btn",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/90 b-btn--primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/90 b-btn--error",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent b-btn--secondary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/80 b-btn--secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground b-btn--ghost",
        link: "text-primary underline-offset-4 hover:underline focus-visible:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-10 rounded-md px-4 text-xs b-btn--sm",
        lg: "h-12 rounded-md px-8 b-btn--lg",
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