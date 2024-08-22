"use client";

import { Button } from "@/components/ui";
import { cn } from "@/utils/css";
import { Loader2, LucideProps } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  text: string;
  selected?: boolean;
  loading?: boolean;
  variant?: "icon" | "icon_destructive";
};

export default function MenuButton({
  onClick,
  className,
  Icon,
  text,
  selected,
  loading,
  variant = "icon",
}: ButtonProps) {
  const css =
    variant === "icon"
      ? "bg-primary text-primary-foreground"
      : "bg-destructive text-destructive-foreground";
  const border = variant === "icon" ? "border-primary" : "border-destructive";
  return (
    <Button
      onClick={onClick}
      className={cn(
        "border-box bg-background p-0 h-6 border box-border",
        border,
        className,
        selected ? css : ""
      )}
      variant={variant}
    >
      <div className="flex items-center gap-3">
        <div className={cn("h-6 w-6 p-1 rounded-md", css)}>
          {loading === true ? <Loader2 className="animate-spin" /> : <Icon />}
        </div>
        <div className="text-xs">{text}</div>
      </div>
    </Button>
  );
}
