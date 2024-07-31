import { HTMLAttributes } from "react";

export default function Title(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className="text-nowrap text-sm text-muted-foreground" />
  );
}
