"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
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
  useOpen,
}: {
  title: string;
  useOpen: [boolean, (open: boolean) => void];
}) {
  const [open, setOpen] = useOpen;
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <div className="w-full flex justify-end">
          <DialogClose>
            <Button asChild>
              <Link href={`/login${param}`}>Login</Link>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Login({
  title = "Please log in first :)",
  useOpen,
}: {
  title?: string;
  useOpen: [boolean, (open: boolean) => void];
}) {
  return (
    <Suspense>
      <_Login title={title} useOpen={useOpen} />
    </Suspense>
  );
}
