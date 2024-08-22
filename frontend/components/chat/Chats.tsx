"use client";

import Chat from "./Chat";
import callApi from "@/utils/callApi";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChatCreateResponse,
  ChatsGetResponse,
} from "gpinterface-shared/type/chat";
import List from "../List";
import NewChat from "./NewChat";
import { useRouter, useSearchParams } from "next/navigation";
import useUserStore from "@/store/user";

function _Chats() {
  const [chats, setChats] = useState<ChatsGetResponse["chats"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const router = useRouter();

  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const searchParams = useSearchParams();
  const chatHashId = useMemo(
    () => searchParams.get("chatHashId"),
    [searchParams]
  );

  const callChatsApi = useCallback(async () => {
    if (chatHashId) return;

    const chatsResponse = await callApi<ChatsGetResponse>({
      endpoint: `/chats?lastHashId=${lastHashId}`,
    });
    if (chatsResponse) {
      setChats((prev) => [...(prev ?? []), ...chatsResponse.chats]);
      if (chatsResponse.chats.length == 0) {
        setSpinnerHidden(true);
      }
    } else {
      const chatResponse = await callApi<ChatCreateResponse>({
        endpoint: "/chat",
        method: "POST",
        body: {},
      });
      if (chatResponse) {
        setChats([chatResponse]);
        setSpinnerHidden(true);
        router.push(`/?chatHashId=${chatResponse.hashId}`);
      }
    }
  }, [lastHashId]);

  useEffect(() => {
    if (!isLoggedOut || !chatHashId) return;

    const callGetChatApi = async () => {
      const response = await callApi<ChatsGetResponse["chats"][0]>({
        endpoint: `/chat/${chatHashId}`,
      });
      if (response) {
        setChats([response]);
        setSpinnerHidden(true);
      }
    };
    callGetChatApi();
  }, [isLoggedOut, chatHashId]);

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div className="absolute top-3 left-3 z-10">
        <NewChat setChats={setChats} />
      </div>
      <div className="h-full overflow-y-auto">
        <List
          callApi={callChatsApi}
          emptyMessage="Start your chat!"
          elements={chats}
          spinnerHidden={spinnerHidden}
          useLastHashId={[lastHashId, setLastHashId]}
        >
          {chats?.map((t) => (
            <div
              key={t.hashId}
              className="w-full border-b border-yellow-300 pb-6 mb-12"
            >
              <Chat chat={t} />
            </div>
          ))}
        </List>
      </div>
    </div>
  );
}

export default function Chats() {
  return (
    <Suspense>
      <_Chats />
    </Suspense>
  );
}
