"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/utils/callApi";
import useUserStore from "@/store/user";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserGetMeResponse } from "gpinterface-shared/type/user";
import {
  LogOut,
  MessageSquareCode,
  ReceiptText,
  Settings,
  SquareCode,
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
import Link from "next/link";

const loginRedirectPaths = ["login"];
const logoutRedirectPaths = ["histories", "settings"];

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

  const onClickLogout = useCallback(async () => {
    setOpen(false);
    await callApi({ endpoint: "/user/logout" });
    setUser(undefined);
    location.reload();
  }, [setUser]);

  const chatHashId = useMemo(
    () => searchParams.get("chatHashId"),
    [searchParams]
  );
  const param = useMemo(() => {
    if (chatHashId) return `?chatHashId=${chatHashId}`;
    return "";
  }, [chatHashId]);

  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <ShadcnButton asChild>
        <Link href={`/login${param}`}>
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
          <DropdownMenuItem onClick={() => push(`/chats`)}>
            <MessageSquareCode />
            <span className="ml-3">Chat</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => push(`/gpis`)}>
            <SquareCode />
            <span className="ml-3">Gpi</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => push("/settings")}>
            <Settings />
            <span className="ml-3">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => push("/bills")}>
            <ReceiptText />
            <span className="ml-3">Bills</span>
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
