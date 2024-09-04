"use client";

import IconTextButton from "@/components/buttons/IconTextButton";
import { Checkbox } from "@/components/ui";
import useUserStore from "@/store/user";
import callApi from "@/utils/callApi";
import { cn } from "@/utils/css";
import { Static } from "@sinclair/typebox";
import {
  UserGetMeResponse,
  UserGithubSchema,
} from "gpinterface-shared/type/user";
import { UserRoundPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function Component() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(true);

  const onClickSignup = useCallback(async () => {
    const code = searchParams.get("code");
    if (!code) {
      return;
    }

    setLoading(true);

    const response = await callApi<
      UserGetMeResponse,
      Static<typeof UserGithubSchema>
    >({
      endpoint: "/user/github",
      method: "POST",
      body: { code },
      showError: true,
    });
    if (response) {
      setUser(response.user);
    } else {
      router.push("/login");
    }
  }, [router, searchParams, setUser]);
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.push("/login");
      return;
    }

    const getUser = async () => {
      const response = await callApi<UserGetMeResponse>({
        endpoint: `/user/github?code=${code}`,
      });
      if (response) {
        setUser(response.user);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, [searchParams, router, setUser]);

  return (
    <div className="w-full flex-1">
      <div className="w-full h-full flex items-center justify-center">
        <div>
          <div
            className={cn(
              "flex items-center gap-3",
              loading ? "invisible" : ""
            )}
          >
            <Checkbox
              id="agree"
              className="w-4 h-4"
              checked={agree}
              onCheckedChange={(c) =>
                typeof c === "boolean" ? setAgree(c) : undefined
              }
              disabled={loading}
            />
            <label htmlFor="agree" className="text-xs">
              I agree to the&nbsp;
              <a
                href="https://www.termsfeed.com/live/0ce4dbce-17c2-4551-89c9-eb14fe206b71"
                target="_blank"
                className="underline"
              >
                privacy policy
              </a>
              &nbsp;and&nbsp;
              <a href="/terms" target="_blank" className="underline">
                terms and conditions
              </a>
            </label>
          </div>
          <div className="mt-3"></div>
          <IconTextButton
            className="w-96"
            disabled={!agree || loading}
            type="submit"
            loading={loading}
            text={loading ? "Loading..." : "Agree"}
            Icon={UserRoundPlus}
            size="large"
            onClick={onClickSignup}
          />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Component />
    </Suspense>
  );
}
