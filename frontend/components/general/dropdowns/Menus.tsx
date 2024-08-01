"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/util/callApi";
import useUserStore from "@/store/user";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserGetMeResponse } from "gpinterface-shared/type/user";
import {
  Bookmark,
  LogOut,
  ReceiptText,
  Settings,
  UserRound,
} from "lucide-react";
import {
  ShadcnButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui";
import Link from "../links/Link";

const loginRedirectPaths = ["login"];
const logoutRedirectPaths = [
  "settings",
  "bookmarks",
  "usages",
  "create",
  "edit",
];

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

  if (!user) {
    return (
      <ShadcnButton asChild>
        <Link href={`/login${redirect}`}>
          <UserRound />
        </Link>
      </ShadcnButton>
    );
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <ShadcnButton>
          <UserRound />
        </ShadcnButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => push(`/user/${user.hashId}`)}>
            <UserRound />
            <span className="ml-3">My page</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => push(`/bookmarks`)}>
            <Bookmark />
            <span className="ml-3">Bookmarks</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => push("/settings")}>
            <Settings />
            <span className="ml-3">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => push("/usages")}>
            <ReceiptText />
            <span className="ml-3">Usages</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onClickLogout}>
            <LogOut />
            <span className="ml-3">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
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
