"use client";

import { Copy } from "lucide-react";
import { Button, useToast } from "../ui";
import { useCallback } from "react";

type Props = { text: string };
export default function CopyButton({ text }: Props) {
  const { toast } = useToast();
  const onClick = useCallback(() => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", duration: 1000 });
  }, [text, toast]);

  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={onClick}>
      <div className="text-sm truncate">{text}</div>
      <Button className="h-6 w-6 p-1">
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
}
