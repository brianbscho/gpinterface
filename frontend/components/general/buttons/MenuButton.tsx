"use client";

import { Button } from "@/components/ui";
import { cn } from "@/utils/css";
import { LucideProps } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  text: string;
  selected?: boolean;
};

export default function MenuButton({
  onClick,
  className,
  Icon,
  text,
  selected,
}: ButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "bg-transparent p-0 h-6",
        className,
        selected ? "bg-primary text-primary-foreground" : ""
      )}
      variant="icon"
    >
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 p-1 bg-primary text-primary-foreground rounded-md">
          <Icon />
        </div>
        <div className="text-xs">{text}</div>
      </div>
    </Button>
  );
}
