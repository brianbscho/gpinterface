"use client";

import { Copy } from "lucide-react";
import { useToast } from "../ui";
import IconTextButton from "./IconTextButton";
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
      <div className="text-sm flex-1 truncate">{text}</div>
      <IconTextButton
        Icon={Copy}
        text="Copy"
        onClick={() => navigator.clipboard.writeText(text)}
        className="w-20"
        size="small"
      />
    </div>
  );
}
