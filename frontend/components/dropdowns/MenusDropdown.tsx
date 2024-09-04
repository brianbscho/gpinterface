"use client";

import { useCallback, useEffect, useState } from "react";
import callApi from "@/utils/callApi";
import useUserStore from "@/store/user";
import { usePathname, useRouter } from "next/navigation";
import { UserGetMeResponse } from "gpinterface-shared/type/user";
import {
  LogOut,
  MessageCircle,
  ReceiptText,
  Settings,
  FileCode,
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
const logoutRedirectPaths = ["bills", "chats", "gpis/user", "settings"];

export default function MenusDropdown() {
  const { user, setUser } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  const { push } = router;

  useEffect(() => {
    const callUserApi = async () => {
      const response = await callApi<UserGetMeResponse>({ endpoint: "/user" });
      setUser(response);
      if (!response && logoutRedirectPaths.some((p) => pathname.includes(p))) {
        push("/");
      }
    };
    callUserApi();
  }, [setUser, push, pathname]);

  useEffect(() => {
    if (user && loginRedirectPaths.some((p) => pathname.includes(p))) {
      push("/");
    }
  }, [user, push, pathname]);

  const onClickLogout = useCallback(async () => {
    setOpen(false);
    await callApi({ endpoint: "/user/logout" });
    setUser(undefined);
    location.reload();
  }, [setUser]);

  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <ShadcnButton asChild className="h-6 w-6 p-0 md:h-8 md:w-8">
        <Link href="/login">
          <UserRound className="h-4 w-4 md:h-5 md:w-5" />
        </Link>
      </ShadcnButton>
    );
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <ShadcnButton className="h-6 w-6 p-0 md:h-8 md:w-8">
          <UserRound className="h-4 w-4 md:h-5 md:w-5" />
        </ShadcnButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => push(`/chats`)}>
            <MessageCircle />
            <span className="ml-3">Chat</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => push(`/gpis/user`)}>
            <FileCode />
            <span className="ml-3">My gpis</span>
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
