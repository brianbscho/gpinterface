"use client";

import callApi from "@/utils/callApi";
import { Fragment, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import List from "@/components/List";
import { ApiResponse, ApisGetResponse } from "gpinterface-shared/type/api";
import { Badge } from "@/components/ui";
import Link from "next/link";

export default function Apis() {
  const [apis, setApis] = useState<ApiResponse[]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const router = useRouter();
  const callApisApi = useCallback(async () => {
    const response = await callApi<ApisGetResponse>({
      endpoint: `/apis?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      if (response.apis.length > 0) {
        setApis((prev) => [...(prev ?? []), ...response.apis]);
      } else {
        setSpinnerHidden(true);
      }
    } else {
      router.push("/");
    }
  }, [lastHashId, router]);

  return (
    <div className="w-full">
      <List
        callApi={callApisApi}
        emptyMessage="No Apis yet"
        elements={apis}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {apis?.map((api, i) => (
          <Link key={api.hashId} href={`/apis/${api.hashId}`}>
            <div className="w-full p-3 border-b">
              <div className="w-full flex gap-3 items-center mb-3">
                <div className="flex-1 truncate">{api.description}</div>
                <div className="text-xs">{api.createdAt}</div>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-3">
                {api.systemMessage.length > 0 && (
                  <>
                    <Badge>system</Badge>
                    <div className="truncate text-sm">{api.systemMessage}</div>
                  </>
                )}
                {api.messages.map((message) => (
                  <Fragment key={message.hashId}>
                    <Badge>{message.role}</Badge>
                    <div className="truncate text-sm">{message.content}</div>
                  </Fragment>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </List>
    </div>
  );
}
