"use client";

import { useCallback, useEffect, useState } from "react";
import callApi from "@/utils/callApi";
import useUserStore from "@/store/user";
import { usePathname, useRouter } from "next/navigation";
import { UserGetMeResponse } from "gpinterface-shared/type/user";
import {
  LogOut,
  ReceiptText,
  Settings,
  FileCode,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui";
import Link from "next/link";
import IconButton from "../buttons/IconButton";

const loginRedirectPaths = ["login"];
const logoutRedirectPaths = ["bills", "profile"];

export default function MenusDropdown() {
  const { user, setUser } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  const { push } = router;

  useEffect(() => {
    const callUserApi = async () => {
      const response = await callApi<UserGetMeResponse>({ endpoint: "/users" });
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
    await callApi({ endpoint: "/users/logout" });
    setUser(undefined);
    location.reload();
  }, [setUser]);

  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link href="/login">
        <IconButton responsive Icon={UserRound} />
      </Link>
    );
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <IconButton responsive Icon={UserRound} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto px-1">
        <DropdownMenuLabel>{`${user.name} ($${user.balance})`}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-3"
            onClick={() => push(`/profile/gpis`)}
          >
            <FileCode className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">My gpis</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-3"
            onClick={() => push("/profile/settings")}
          >
            <Settings className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-3" onClick={() => push("/bills")}>
            <ReceiptText className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Bills</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-3" onClick={onClickLogout}>
            <LogOut className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
