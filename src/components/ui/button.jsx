import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const glassShell =
  "border border-white/55 bg-white/70 text-foreground shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] backdrop-blur-md transition-all duration-200 ease-out hover:-translate-y-px hover:bg-white/85 hover:shadow-[0_6px_20px_-6px_rgba(15,23,42,0.12)] active:translate-y-0 active:shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)]"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-normal text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: glassShell,
        destructive:
          "border border-red-200/70 bg-white/75 text-destructive shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-px hover:bg-red-50/90 hover:shadow-[0_6px_20px_-6px_rgba(220,38,38,0.12)] active:translate-y-0 focus-visible:ring-destructive/25",
        outline: glassShell,
        secondary: glassShell,
        ghost:
          "border border-transparent bg-transparent text-foreground shadow-none backdrop-blur-0 hover:-translate-y-px hover:border-white/40 hover:bg-white/55 hover:shadow-[0_4px_16px_-6px_rgba(15,23,42,0.1)] hover:backdrop-blur-sm active:translate-y-0",
        link: "border-transparent bg-transparent text-foreground underline-offset-4 shadow-none hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
