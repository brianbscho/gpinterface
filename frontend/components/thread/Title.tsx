import { cn } from "@/utils/css";
import { HTMLAttributes } from "react";

export default function Title(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "text-nowrap text-sm text-muted-foreground",
        props.className
      )}
    />
  );
}
