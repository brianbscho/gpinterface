import * as React from "react";

import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const ShadcnInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
ShadcnInput.displayName = "ShadcnInput";

function Input({
  Icon,
  ...props
}: InputProps &
  React.RefAttributes<HTMLInputElement> & {
    Icon?: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
  }) {
  return (
    <div className="relative w-full">
      <ShadcnInput
        {...props}
        className={cn(props.className, !Icon ? "" : "pl-10")}
      />
      {!!Icon && (
        <span className="absolute start-0 inset-y-0 flex items-center justify-center px-2">
          <Icon />
        </span>
      )}
    </div>
  );
}
Input.displayName = "Input";

export { Input };
