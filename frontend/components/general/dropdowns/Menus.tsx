"use client";

import { AvatarIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu } from "@radix-ui/themes";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/util/callApi";
import useUserStore from "@/store/user";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserGetMeResponse } from "gpinterface-shared/type/user";

const loginRedirectPaths = ["login"];
const logoutRedirectPaths = ["settings", "edit", "create"];

function _Menus() {
  const { user, setUser } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  const { push } = router;

  useEffect(() => {
    const callUserApi = async () => {
      const response = await callApi<UserGetMeResponse>({ endpoint: "/user" });
      setUser(response?.user);
      if (!response && logoutRedirectPaths.some((p) => pathname.includes(p))) {
        push("/");
      }
    };
    callUserApi();
  }, [setUser, push, pathname]);

  const searchParams = useSearchParams();
  useEffect(() => {
    const redirectPath = searchParams.get("redirect");
    if (user && loginRedirectPaths.some((p) => pathname.includes(p))) {
      if (redirectPath) {
        push(redirectPath);
      } else {
        push("/");
      }
    }
  }, [user, push, pathname, searchParams]);

  const onClickLogout = useCallback(() => {
    setOpen(false);
    callApi({ endpoint: "/user/logout" });
    setUser(undefined);
    location.reload();
  }, [setUser]);

  const redirect = useMemo(() => {
    if (pathname.includes("login")) return "";
    if (pathname === "/") {
      return "";
    } else {
      return `?redirect=${pathname}`;
    }
  }, [pathname]);

  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="focus:outline-none">
        <Button>{!user ? <HamburgerMenuIcon /> : <AvatarIcon />}</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {!user ? (
          <DropdownMenu.Item onClick={() => push(`/login${redirect}`)}>
            Login
          </DropdownMenu.Item>
        ) : (
          <>
            <DropdownMenu.Item onClick={() => push(`/user/${user.hashId}`)}>
              My page
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => push("/settings")}>
              Settings
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => push("/usages")}>
              Usages
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={onClickLogout}>
              Logout
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default function Menus() {
  return (
    <Suspense>
      <_Menus />
    </Suspense>
  );
}
