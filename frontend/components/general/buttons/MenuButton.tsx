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

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  text: string;
  selected?: boolean;
  loading?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "icon" | "icon_destructive";
};

export default function MenuButton({
  className,
  Icon,
  text,
  selected,
  loading,
  variant = "icon",
  size = "medium",
  ...props
}: ButtonProps) {
  const css =
    variant === "icon"
      ? "bg-primary text-primary-foreground"
      : "bg-destructive text-destructive-foreground";
  const border = variant === "icon" ? "border-primary" : "border-destructive";

  const sizeClass = { small, medium, large }[size];

  return (
    <Button
      {...props}
      className={cn(
        `border-box bg-background p-0 ${sizeClass.paddingLeft} ${sizeClass.height} border box-border relative`,
        border,
        className,
        selected ? css : ""
      )}
      variant={variant}
    >
      <div
        className={cn(
          `${sizeClass.height} ${sizeClass.width} ${sizeClass.padding} rounded-md absolute -top-px -left-px`,
          css
        )}
      >
        {loading === true ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Icon className={`${sizeClass.iconHeight} ${sizeClass.iconWidth}`} />
        )}
      </div>
      <div className={`w-full ${sizeClass.fontSize}`}>{text}</div>
    </Button>
  );
}
