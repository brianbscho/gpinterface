"use client";

import { Button } from "@/components/ui";
import { cn } from "@/utils/css";
import { Loader2, LucideProps } from "lucide-react";

const small = {
  height: "h-6",
  width: "w-6",
  paddingLeft: "pl-6",
  padding: "p-1",
  iconHeight: "h-4",
  iconWidth: "w-4",
  fontSize: "text-xs",
};
const medium = {
  height: "h-8",
  width: "w-8",
  paddingLeft: "pl-8",
  padding: "p-1.5",
  iconHeight: "h-5",
  iconWidth: "w-5",
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
  padding: "p-1 md:p-1.5",
  iconHeight: "h-4 md:h-5",
  iconWidth: "w-4 md:w-5",
  fontSize: "text-xs md:text-sm",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  loading?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "icon" | "icon_destructive";
  responsive?: boolean;
};

export default function IconButton({
  className,
  Icon,
  loading,
  variant = "icon",
  size = "medium",
  responsive = false,
  ...props
}: ButtonProps) {
  const css =
    variant === "icon"
      ? "border-none bg-background hover:bg-neutral-400"
      : "border-destructive bg-background hover:bg-destructive";

  const sizeClass = responsive
    ? responsiveClass
    : { small, medium, large }[size];

  return (
    <Button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        `text-neutral-400 ${sizeClass.width} ${sizeClass.height} ${sizeClass.padding} border`,
        css,
        className
      )}
      variant={variant}
    >
      {loading === true ? (
        <Loader2
          className={`animate-spin ${sizeClass.iconHeight} ${sizeClass.iconWidth}`}
        />
      ) : (
        <Icon className={`${sizeClass.iconHeight} ${sizeClass.iconWidth}`} />
      )}
    </Button>
  );
}
