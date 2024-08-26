"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState, Fragment } from "react";
import List from "@/components/List";
import { ApisGetResponse } from "gpinterface-shared/type/gpi";
import { Badge } from "@/components/ui";
import Link from "next/link";

function Api({ gpi }: { gpi: ApisGetResponse["gpis"][0] }) {
  const messages = [
    {
      hashId: Math.random().toString(),
      role: "system",
      content: gpi.systemMessage,
    },
    ...gpi.messages,
  ]
    .filter((m) => m.content.length > 0)
    .slice(0, 2);
  return (
    <Link key={gpi.hashId} href={`/apis/${gpi.hashId}`}>
      <div className="w-full p-3 border-b">
        <div className="w-full flex gap-3 items-end mb-3">
          <div className="truncate">{gpi.description}</div>
          <div className="text-neutral-400 text-xs mb-1">{gpi.createdAt}</div>
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
  const [gpis, setApis] = useState<ApisGetResponse["gpis"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callApisApi = useCallback(async () => {
    const response = await callApi<ApisGetResponse>({
      endpoint: `/apis?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      setApis((prev) => [...(prev ?? []), ...response.gpis]);
      if (response.gpis.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  return (
    <div className="w-full">
      <List
        callApi={callApisApi}
        emptyMessage="No Apis yet"
        elements={gpis}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {gpis?.map((gpi) => (
          <Api key={gpi.hashId} gpi={gpi} />
        ))}
      </List>
    </div>
  );
}
