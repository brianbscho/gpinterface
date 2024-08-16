"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import List from "@/components/List";
import { ApiChatsGetResponse } from "gpinterface-shared/type/api";
import { Badge } from "@/components/ui";
import Collapsible from "@/components/general/collapsible";

export default function Chats({ apiHashId }: { apiHashId: string }) {
  const [chats, setChats] = useState<ApiChatsGetResponse["chats"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const router = useRouter();
  const callChatsApi = useCallback(async () => {
    const response = await callApi<ApiChatsGetResponse>({
      endpoint: `/api/${apiHashId}/chats?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      if (response.chats.length > 0) {
        setChats((prev) => [...(prev ?? []), ...response.chats]);
      } else {
        setSpinnerHidden(true);
      }
    } else {
      router.push("/");
    }
  }, [apiHashId, lastHashId, router]);

  return (
    <div className="w-full">
      <List
        callApi={callChatsApi}
        emptyMessage="No Chats yet"
        elements={chats}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {chats?.map((chat) => (
          <div key={chat.hashId} className="w-full p-3 border-b">
            <div className="text-xs mb-3">{chat.createdAt}</div>
            <Badge className="mb-1">{chat.messages[0].role}</Badge>
            <div className="whitespace-pre-wrap text-sm">
              {chat.messages[0].content}
            </div>
            <Collapsible title="Show answer">
              <div className="mt-1">
                <Badge className="mb-1">{chat.messages[1].role}</Badge>
                <div className="whitespace-pre-wrap text-sm">
                  {chat.messages[1].content}
                </div>
              </div>
            </Collapsible>
          </div>
        ))}
      </List>
    </div>
  );
}
