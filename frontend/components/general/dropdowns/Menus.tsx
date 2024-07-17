"use client";

import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu } from "@radix-ui/themes";
import { MouseEventHandler, useCallback, useState } from "react";
import callApi from "@/util/callApi";
import useUserStore from "@/store/user";
import Link from "../links/Link";

export default function Menus() {
  const { user, setUser } = useUserStore();
  const onClickLogout: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      e.preventDefault();
      setOpen(false);
      callApi({ endpoint: "/user/logout" });
      setUser(undefined);
      location.reload();
    },
    [setUser]
  );

  const [open, setOpen] = useState(false);

  if (!user) return null;
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="focus:outline-none">
        <Button>
          <HamburgerMenuIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item asChild>
          <Link href={`/user/${user.hashId}`} onClick={() => setOpen(false)}>
            My page
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link href="/settings" onClick={() => setOpen(false)}>
            Settings
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link href="/usages" onClick={() => setOpen(false)}>
            Usages
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <a href="/logout" onClick={onClickLogout}>
            Logout
          </a>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
