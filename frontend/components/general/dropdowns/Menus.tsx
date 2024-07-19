"use client";

import { AvatarIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu } from "@radix-ui/themes";
import {
  MouseEventHandler,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import callApi from "@/util/callApi";
import useUserStore from "@/store/user";
import Link from "../links/Link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserGetMeResponse } from "gpinterface-shared/type/user";

const loginRedirectPaths = ["login"];
const logoutRedirectPaths = ["settings", "edit", "create"];

function _Menus() {
  const { user, setUser } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const callUserApi = async () => {
      const response = await callApi<UserGetMeResponse>({ endpoint: "/user" });
      setUser(response?.user);
      if (!response && logoutRedirectPaths.some((p) => pathname.includes(p))) {
        router.push("/");
      }
    };
    callUserApi();
  }, [setUser, router, pathname]);

  const searchParams = useSearchParams();
  useEffect(() => {
    const redirectPath = searchParams.get("redirect");
    if (user && loginRedirectPaths.some((p) => pathname.includes(p))) {
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/");
      }
    }
  }, [user, router, pathname, searchParams]);

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
          <DropdownMenu.Item>
            <Link href={`/login${redirect}`}>Login</Link>
          </DropdownMenu.Item>
        ) : (
          <>
            <DropdownMenu.Item asChild>
              <Link
                href={`/user/${user.hashId}`}
                onClick={() => setOpen(false)}
              >
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
