import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

interface GradientButtonProps extends ButtonProps {
  gradient?: "primary" | "secondary" | "accent" | "rainbow"
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, gradient = "primary", children, ...props }, ref) => {
    const gradientClasses = {
      primary: "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
      secondary: "bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90",
      accent: "bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-700",
      rainbow: "bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/80 hover:via-secondary/80 hover:to-accent/80",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          gradientClasses[gradient],
          "text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

GradientButton.displayName = "GradientButton"

export { GradientButton }