"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState, Fragment } from "react";
import List from "@/components/List";
import { GpisUserGetResponse } from "gpinterface-shared/type/gpi";
import { Badge } from "@/components/ui";
import Link from "next/link";

function Gpi({ gpi }: { gpi: GpisUserGetResponse["gpis"][0] }) {
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
    <Link key={gpi.hashId} href={`/gpis/${gpi.hashId}`}>
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
  const [gpis, setGpis] = useState<GpisUserGetResponse["gpis"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callGpisApi = useCallback(async () => {
    const response = await callApi<GpisUserGetResponse>({
      endpoint: `/gpis/user?lastHashId=${lastHashId}`,
      redirectToMain: true,
    });
    if (response) {
      setGpis((prev) => [...(prev ?? []), ...response.gpis]);
      if (response.gpis.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  return (
    <div className="w-full">
      <List
        callApi={callGpisApi}
        emptyMessage="No Gpis yet"
        elements={gpis}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {gpis?.map((gpi) => (
          <Gpi key={gpi.hashId} gpi={gpi} />
        ))}
      </List>
    </div>
  );
}
