"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui";

function _Login({
  title,
  open,
  onClickLogin,
}: {
  title: string;
  open: boolean;
  onClickLogin?: () => void;
}) {
  const searchParams = useSearchParams();
  const chatHashId = useMemo(
    () => searchParams.get("chatHashId"),
    [searchParams]
  );
  const param = useMemo(() => {
    if (chatHashId) return `?chatHashId=${chatHashId}`;
    return "";
  }, [chatHashId]);

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <div className="w-full flex justify-end">
          <DialogClose>
            <Button asChild>
              <Link href={`/login${param}`} onClick={onClickLogin}>
                Login
              </Link>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Login({
  title = "Please log in first :)",
  open,
  onClickLogin,
}: {
  title?: string;
  open: boolean;
  onClickLogin?: () => void;
}) {
  return (
    <Suspense>
      <_Login title={title} open={open} onClickLogin={onClickLogin} />
    </Suspense>
  );
}
