"use client";

import IconTextButton from "@/components/buttons/IconTextButton";
import useUserStore from "@/store/user";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import {
  UserGetMeResponse,
  UserGithubSchema,
} from "gpinterface-shared/type/user";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function Component() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const code = searchParams.get("code");
    const chatHashId = searchParams.get("chatHashId");
    if (!code) {
      router.push("/login");
      return;
    }

    const callGithubSigninApi = async () => {
      const response = await callApi<
        UserGetMeResponse,
        Static<typeof UserGithubSchema>
      >({
        endpoint: "/user/github",
        method: "POST",
        body: { code, chatHashId },
        showError: true,
      });
      if (response) {
        setUser(response.user);
      } else {
        router.push("/login");
      }
    };
    callGithubSigninApi();
  }, [searchParams, router, setUser]);

  return (
    <div className="w-full flex-1">
      <div className="w-full h-full flex items-center justify-center">
        <IconTextButton
          className="w-32 md:w-40"
          Icon={Loader2}
          text="Please wait..."
          loading
          responsive
        />
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
