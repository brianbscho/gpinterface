"use client";

import Thread from "@/components/thread/Thread";
import callApi from "@/utils/callApi";
import { useCallback, useEffect, useState } from "react";
import { Thread as ThreadType } from "gpinterface-shared/type";
import { ThreadsGetResponse } from "gpinterface-shared/type/thread";
import Link from "../general/links/Link";
import List from "../List";

export default function Threads({
  baseUrl,
  emptyMessage = "No threads yet",
}: {
  baseUrl: string;
  emptyMessage?: string;
}) {
  const [threads, setThreads] = useState<ThreadType[]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  useEffect(() => {
    setThreads(undefined);
    setLastHashId("");
    setSpinnerHidden(false);
  }, [baseUrl]);
  const callThreadsApi = useCallback(async () => {
    const response = await callApi<ThreadsGetResponse>({
      endpoint: `${baseUrl}&lastHashId=${lastHashId}`,
    });
    if (response) {
      setThreads((prev) => [...(prev ?? []), ...response.threads]);
    }
    if (response?.threads.length === 0) {
      setSpinnerHidden(true);
    }
  }, [baseUrl, lastHashId]);

  return (
    <List
      callApi={callThreadsApi}
      emptyMessage={emptyMessage}
      elements={threads}
      spinnerHidden={spinnerHidden}
      useLastHashId={[lastHashId, setLastHashId]}
    >
      {threads?.map((t) => (
        <Link key={t.hashId} href={`/thread/${t.hashId}`}>
          <Thread thread={t} />
        </Link>
      ))}
    </List>
  );
}
