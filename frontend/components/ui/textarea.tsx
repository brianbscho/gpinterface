"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (props.onKeyUp) props.onKeyUp(e);

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      const text = e.currentTarget.value;
      const style = window.getComputedStyle(e.currentTarget);
      const fontProps = `${style["fontSize"]} ${style["fontFamily"]}`;
      context.font = fontProps;

      let lineCount = 0;
      const lines = text.split("\n");
      const maxWidth = e.currentTarget.clientWidth;

      lines.forEach((line) => {
        const metrics = context.measureText(line);
        const textWidth = metrics.width + 50;
        lineCount += Math.ceil(textWidth / maxWidth);
      });
      e.currentTarget.setAttribute(
        "style",
        `height: ${lineCount * 20 + 16}px;`
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
