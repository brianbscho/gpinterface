"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/util/callApi";
import useUserStore from "@/store/user";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserGetMeResponse } from "gpinterface-shared/type/user";
import { Menu, UserRound } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

const loginRedirectPaths = ["login"];
const logoutRedirectPaths = ["settings", "usages"];

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="focus:outline-none">
        <Button>{!user ? <Menu /> : <UserRound />}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {!user ? (
          <DropdownMenuItem onClick={() => push(`/login${redirect}`)}>
            Login
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => push(`/user/${user.hashId}`)}>
              My page
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => push("/usages")}>
              Usages
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onClickLogout}>Logout</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Menus() {
  return (
    <Suspense>
      <_Menus />
    </Suspense>
  );
}
