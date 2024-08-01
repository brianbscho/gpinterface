"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resizing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ resizing, className, ...props }, ref) => {
    const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (props.onKeyUp) props.onKeyUp(e);

      if (!resizing) return;
      e.currentTarget.setAttribute("style", "height: auto;");
      e.currentTarget.setAttribute(
        "style",
        `height: ${e.currentTarget.scrollHeight}px;`
      );
    };

    return (
      <textarea
        className={cn(
          "flex max-h-96 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
        onKeyUp={onKeyUp}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
