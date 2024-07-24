"use client";

import { ShareIcon } from "lucide-react";
import { useCallback } from "react";
import { useToast } from "@/components/ui";

export default function Share({ threadHashId }: { threadHashId: string }) {
  const { toast } = useToast();

  const onClickButton = useCallback(() => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/thread/${threadHashId}`
    );
    toast({ description: "Share link copied!", duration: 1000 });
  }, [threadHashId, toast]);

  return (
    <div className="h-5">
      <button onClick={onClickButton}>
        <div className="flex gap-3 items-end">
          <ShareIcon />
          <div className="text-sm">share</div>
        </div>
      </button>
    </div>
  );
}
