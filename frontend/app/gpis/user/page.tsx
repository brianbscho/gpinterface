"use client";

import Gpi from "@/components/gpi/Gpi";
import GpiDraft from "@/components/gpi/GpiDraft";
import List from "@/components/List";
import useProviderTypes from "@/hooks/useProviderTypes";
import callApi from "@/utils/callApi";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";
import { useCallback, useState } from "react";

export default function Page() {
  const [chats, setChats] = useState<ChatsGetResponse>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callChatsApi = useCallback(async () => {
    const response = await callApi<ChatsGetResponse>({
      endpoint: `/chats/user?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      setChats((prev) => [...(prev ?? []), ...response]);
      if (response.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  useProviderTypes();

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 p-3">
        <List
          callApi={callChatsApi}
          emptyMessage={"Start your chat!"}
          elements={chats}
          spinnerHidden={spinnerHidden}
          useLastHashId={[lastHashId, setLastHashId]}
        >
          {chats?.map((chat) => {
            const { gpis, userHashId, ...rest } = chat;
            if (gpis.length > 0) {
              return (
                <Gpi
                  key={chat.hashId}
                  gpi={{ ...gpis[0], userHashId, chat: rest }}
                />
              );
            }
            return <GpiDraft key={chat.hashId} chat={chat} />;
          })}
        </List>
      </div>
    </div>
  );
}
