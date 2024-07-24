"use client";

import "./styles.css";

import * as Toast from "@radix-ui/react-toast";
import { ShareIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Share({
  time = 100,
  threadHashId,
}: {
  time?: number;
  threadHashId: string;
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
  const onClickButton = useCallback(() => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/thread/${threadHashId}`
    );
    setOpen(false);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setOpen(true);
    }, time);
  }, [time, threadHashId]);

  return (
    <div className="h-5">
      <Toast.Provider swipeDirection="right" duration={1000}>
        <button onClick={onClickButton}>
          <div className="flex gap-3 items-end">
            <ShareIcon />
            <div className="text-sm">share</div>
          </div>
        </button>
        <Toast.Root className="ToastRoot" open={open} onOpenChange={setOpen}>
          <Toast.Title>Share link copied!</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="ToastViewport" />
      </Toast.Provider>
    </div>
  );
}
