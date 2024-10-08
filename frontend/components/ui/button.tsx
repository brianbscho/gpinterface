import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/css";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        muted: "bg-muted text-muted-foreground hover:bg-muted/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        icon: "bg-primary text-secondary-foreground hover:bg-primary hover:text-primary-foreground justify-start",
        icon_destructive:
          "bg-destructive text-destructive hover:bg-destructive hover:text-secondary-foreground justify-start",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const ShadcnButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ShadcnButton.displayName = "ShadcnButton";

function Button({
  loading,
  ...props
}: ButtonProps &
  React.RefAttributes<HTMLButtonElement> & { loading?: boolean }) {
  if (props.asChild) {
    return <ShadcnButton {...props} />;
  }

  return (
    <ShadcnButton {...props} disabled={props.disabled || loading}>
      {loading && (
        <div className="h-full w-full p-0">
          <Loader2 className="h-full w-full animate-spin" />
        </div>
      )}
      {loading && typeof props.children === "string" && (
        <div className="mr-2"></div>
      )}
      {typeof props.children === "string" || !loading
        ? props.children
        : undefined}
    </ShadcnButton>
  );
}
Button.displayName = "Button";

export { ShadcnButton, Button, buttonVariants };
