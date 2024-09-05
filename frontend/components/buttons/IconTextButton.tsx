"use client";

import { Button } from "@/components/ui";
import { cn } from "@/utils/css";
import { Loader2, LucideProps } from "lucide-react";

const small = {
  height: "h-6",
  width: "w-6",
  paddingLeft: "pl-6",
  padding: "p-1.5",
  iconHeight: "h-3",
  iconWidth: "w-3",
  fontSize: "text-xs",
};
const medium = {
  height: "h-8",
  width: "w-8",
  paddingLeft: "pl-8",
  padding: "p-2",
  iconHeight: "h-4",
  iconWidth: "w-4",
  fontSize: "text-sm",
};
const large = {
  height: "h-10",
  width: "w-10",
  paddingLeft: "pl-10",
  padding: "p-2",
  iconHeight: "h-6",
  iconWidth: "w-6",
  fontSize: "text-base",
};
const responsiveClass = {
  height: "h-6 md:h-8",
  width: "w-6 md:w-8",
  paddingLeft: "pl-6 md:pl-8",
  padding: "p-1.5 md:p-2",
  iconHeight: "h-3 md:h-4",
  iconWidth: "w-3 md:w-4",
  fontSize: "text-xs md:text-sm",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  text: string;
  loading?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "icon" | "icon_destructive";
  responsive?: boolean;
};

export default function IconTextButton({
  className,
  Icon,
  text,
  loading,
  variant = "icon",
  size = "medium",
  responsive = false,
  ...props
}: ButtonProps) {
  const css =
    variant === "icon"
      ? "hover:bg-primary border-primary text-primary hover:text-primary-foreground"
      : "hover:bg-destructive text-destructive-foreground border-destructive";

  const sizeClass = responsive
    ? responsiveClass
    : { small, medium, large }[size];

  return (
    <Button
      {...props}
      className={cn(
        `bg-background p-0 ${sizeClass.paddingLeft} ${sizeClass.height} border box-border relative`,
        css,
        className
      )}
      variant={variant}
      disabled={props.disabled || loading}
    >
      <div
        className={cn(
          `${sizeClass.height} ${sizeClass.width} ${sizeClass.padding} rounded-md absolute -top-px -left-px`
        )}
      >
        {loading === true ? (
          <Loader2
            className={`animate-spin ${sizeClass.iconHeight} ${sizeClass.iconWidth}`}
          />
        ) : (
          <Icon className={`${sizeClass.iconHeight} ${sizeClass.iconWidth}`} />
        )}
      </div>
      <div
        className={`w-full px-3 font-light md:font-normal ${sizeClass.fontSize}`}
      >
        {text}
      </div>
    </Button>
  );
}
