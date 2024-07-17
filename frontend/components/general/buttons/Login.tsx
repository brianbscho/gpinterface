"use client";

import callApi from "@/util/callApi";
import { Button } from "@radix-ui/themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useUserStore from "@/store/user";
import { UserGetMeResponse } from "gpinterface-shared/type/user";
import Link from "../links/Link";

const loginRedirectPaths = ["login"];
const logoutRedirectPaths = ["settings", "edit", "create"];

function LoginButton() {
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
  const redirectPath = searchParams.get("redirect");
  useEffect(() => {
    if (user && loginRedirectPaths.some((p) => pathname.includes(p))) {
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/");
      }
    }
  }, [user, router, pathname, redirectPath]);

  const [redirect, setRedirect] = useState("");
  useEffect(() => {
    if (pathname.includes("login")) return;
    if (pathname === "/") {
      setRedirect("");
    } else {
      setRedirect(`?redirect=${pathname}`);
    }
  }, [pathname]);

  if (!user) {
    return (
      <Button asChild>
        <Link href={`/login${redirect}`}>Login</Link>
      </Button>
    );
  }
  return null;
}

export default function Login() {
  return (
    <Suspense>
      <LoginButton />
    </Suspense>
  );
}
