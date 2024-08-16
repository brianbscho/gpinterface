"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui";

export default function Login({
  title = "Please log in first :)",
  open,
  onClickLogin,
}: {
  title?: string;
  open: boolean;
  onClickLogin?: () => void;
}) {
  const pathname = usePathname();
  const [redirect, setRedirect] = useState("");
  useEffect(() => {
    if (pathname.includes("login")) return;
    if (pathname === "/") {
      setRedirect("");
    } else {
      setRedirect(`?redirect=${pathname}`);
    }
  }, [pathname]);

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <div className="w-full flex justify-end">
          <DialogClose>
            <Button asChild>
              <Link href={`/login${redirect}`} onClick={onClickLogin}>
                Login
              </Link>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
