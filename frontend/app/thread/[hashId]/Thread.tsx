"use client";

import callApi from "@/utils/callApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Thread as ThreadType } from "gpinterface-shared/type";
import Posts from "./Posts";
import Share from "@/components/general/toasts/Share";
import CreatePost from "@/components/post/CreatePost";
import Collapsible from "@/components/general/collapsible";
import { ThreadGetResponse } from "gpinterface-shared/type/thread";
import LoginRequiredButton from "@/components/general/buttons/LoginRequiredButton";
import { Badge } from "@/components/ui";

export default function Thread({ hashId }: { hashId: string }) {
  const [thread, setThread] = useState<ThreadType>();
  const router = useRouter();
  useEffect(() => {
    const callThreadsApi = async () => {
      const response = await callApi<ThreadGetResponse>({
        endpoint: `/thread/${hashId}`,
        showError: true,
      });
      if (response) {
        setThread(response.thread);
      } else {
        router.push("/");
      }
    };
    callThreadsApi();
  }, [hashId, router]);

  if (!thread) {
    return null;
  }
  return (
    <div className="w-full max-w-7xl px-3 pb-12">
      <div className="py-1 border-b flex items-end justify-between">
        <div className="flex items-center gap-3">
          {!thread.isPublic && <Badge>private</Badge>}
          <div className="text-lg font-bold">{thread.title}</div>
        </div>
        {thread.isPublic && <Share threadHashId={hashId} />}
      </div>
      <Posts baseUrl={`/posts/${hashId}`} />
      <div className="w-full mt-3">
        <LoginRequiredButton>
          <Collapsible title="Write Post">
            <CreatePost thread={thread} />
          </Collapsible>
        </LoginRequiredButton>
      </div>
    </div>
  );
}
