"use client";

import Chat from "./Chat";
import callApi from "@/utils/callApi";
import { useCallback, useState } from "react";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";
import List from "../List";
import NewChat from "./NewChat";

export default function Chats() {
  const [chats, setChats] = useState<ChatsGetResponse["chats"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callChatsApi = useCallback(async () => {
    const response = await callApi<ChatsGetResponse>({
      endpoint: `/chats?lastHashId=${lastHashId}`,
    });
    if (response) {
      setChats((prev) => [...(prev ?? []), ...response.chats]);
    }
    if (response?.chats.length === 0) {
      setSpinnerHidden(true);
    }
  }, [lastHashId]);

  return (
    <div className="px-3 pr-0 w-full h-full overflow-hidden bg-muted">
      <div className="h-full overflow-y-auto pt-3 pr-3">
        <div className="sticky top-0 ml-3 pb-3 z-30 w-28">
          <NewChat setChats={setChats} />
        </div>
        <List
          callApi={callChatsApi}
          emptyMessage="Start your chat!"
          elements={chats}
          spinnerHidden={spinnerHidden}
          useLastHashId={[lastHashId, setLastHashId]}
        >
          {chats?.map((t) => (
            <Chat key={t.hashId} chat={t} />
          ))}
        </List>
      </div>
    </div>
  );
}
