"use client";

import { Button, Dialog } from "@radix-ui/themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "../links/Link";

export default function Login({
  title = "Please log in first :)",
  open,
  onClickLogin,
}: {
  title?: string;
  open: boolean;
  onClickLogin: () => void;
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
    <Dialog.Root open={open}>
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>
        <div className="w-full flex justify-end">
          <Dialog.Close>
            <Button asChild>
              <Link href={`/login${redirect}`} onClick={onClickLogin}>
                Login
              </Link>
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
