"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState } from "react";
import List from "@/components/List";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";
import Chat from "./Chat";

export default function Chats() {
  const [chats, setChats] = useState<ChatsGetResponse["chats"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callChatsChat = useCallback(async () => {
    const response = await callApi<ChatsGetResponse>({
      endpoint: `/chats?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      setChats((prev) => [...(prev ?? []), ...response.chats]);
      if (response.chats.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  return (
    <div className="w-full">
      <List
        callApi={callChatsChat}
        emptyMessage="No Chats yet"
        elements={chats}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {chats?.map((chat) => (
          <Chat key={chat.hashId} chat={chat} />
        ))}
      </List>
    </div>
  );
}
