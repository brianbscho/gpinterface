"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState, Fragment } from "react";
import List from "@/components/List";
import { ApisGetResponse } from "gpinterface-shared/type/api";
import { Badge } from "@/components/ui";
import Link from "next/link";

function Api({ api }: { api: ApisGetResponse["apis"][0] }) {
  const messages = [
    {
      hashId: Math.random().toString(),
      role: "system",
      content: api.systemMessage,
    },
    ...api.messages,
  ]
    .filter((m) => m.content.length > 0)
    .slice(0, 2);
  return (
    <Link key={api.hashId} href={`/apis/${api.hashId}`}>
      <div className="w-full p-3 border-b">
        <div className="w-full flex gap-3 items-end mb-3">
          <div className="truncate">{api.description}</div>
          <div className="text-neutral-400 text-xs mb-1">{api.createdAt}</div>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          {messages.map((message) => (
            <Fragment key={message.hashId}>
              <div className="text-right">
                <Badge variant="tag">{message.role}</Badge>
              </div>
              <div className="truncate text-sm">{message.content}</div>
            </Fragment>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function Page() {
  const [apis, setApis] = useState<ApisGetResponse["apis"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callApisApi = useCallback(async () => {
    const response = await callApi<ApisGetResponse>({
      endpoint: `/apis?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      setApis((prev) => [...(prev ?? []), ...response.apis]);
      if (response.apis.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  return (
    <div className="w-full">
      <List
        callApi={callApisApi}
        emptyMessage="No Apis yet"
        elements={apis}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {apis?.map((api) => (
          <Api key={api.hashId} api={api} />
        ))}
      </List>
    </div>
  );
}
