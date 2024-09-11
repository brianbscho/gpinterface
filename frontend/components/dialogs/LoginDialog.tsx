"use client";

import Link from "next/link";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui";
import useLoginStore from "@/store/login";
import { useCallback } from "react";

export default function LoginDialog() {
  const [message, setOpen] = useLoginStore((state) => [
    state.message,
    state.setOpen,
  ]);
  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setOpen(open);
      }
    },
    [setOpen]
  );
  const onClick = useCallback(() => setOpen(false), [setOpen]);

  return (
    <Dialog open={message.length > 0} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{message}</DialogTitle>
        <div className="w-full flex justify-end">
          <DialogClose>
            <Button asChild onClick={onClick}>
              <Link href="/login">Login</Link>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
