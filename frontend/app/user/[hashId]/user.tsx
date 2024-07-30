"use client";

import Threads from "@/components/thread/Threads";
import callApi from "@/util/callApi";
import { useEffect, useMemo, useState } from "react";
import { UserInfo } from "gpinterface-shared/type";
import { UserGetResponse } from "gpinterface-shared/type/user";
import { useRouter } from "next/navigation";

export default function User({ hashId }: { hashId: string }) {
  const router = useRouter();
  const [pageUser, setPageUser] = useState<UserInfo>();
  useEffect(() => {
    const callUserApi = async () => {
      const response = await callApi<UserGetResponse>({
        endpoint: `/user/${hashId}`,
        showError: true,
      });
      if (response) {
        setPageUser(response.user);
      } else {
        router.push("/");
      }
    };
    callUserApi();
  }, [hashId, router]);

  const { name } = useMemo(() => {
    if (!pageUser) return { name: "" };
    return pageUser;
  }, [pageUser]);

  return (
    <div className="w-full max-w-7xl px-3">
      <div className="flex items-center gap-3 bg-background mt-3">
        <div className="text-lg font-bold">{name}</div>
      </div>
      <Threads baseUrl={`/threads/user/${hashId}?type=post`} />
    </div>
  );
}
