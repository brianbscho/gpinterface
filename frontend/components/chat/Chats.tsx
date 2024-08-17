"use client";

import Chat from "./Chat";
import callApi from "@/utils/callApi";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChatCreateResponse,
  ChatCreateSchema,
  ChatsGetResponse,
} from "gpinterface-shared/type/chat";
import List from "../List";
import NewChat from "./NewChat";
import { Static } from "@sinclair/typebox";
import useContentStore from "@/store/content";
import { useRouter, useSearchParams } from "next/navigation";
import useUserStore from "@/store/user";
import { getApiConfig } from "@/utils/model";

function _Chats() {
  const [chats, setChats] = useState<ChatsGetResponse["chats"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const router = useRouter();
  const [model, config] = useContentStore((state) => [
    state.model,
    state.config,
  ]);

  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const searchParams = useSearchParams();
  const chatHashId = useMemo(
    () => searchParams.get("chatHashId"),
    [searchParams]
  );

  const [shouldCallChat, setShouldCallChat] = useState(false);
  useEffect(() => {
    if (!shouldCallChat) return;

    const callPostChatApi = async () => {
      if (!model) return;

      const response = await callApi<
        ChatCreateResponse,
        Static<typeof ChatCreateSchema>
      >({
        endpoint: "/chat",
        method: "POST",
        body: {
          modelHashId: model.hashId,
          config: getApiConfig(model, config),
        },
      });
      if (response) {
        router.push(`/?chatHashId=${response.hashId}`);
      }
    };
    callPostChatApi();
  }, [shouldCallChat, model, config, router]);
  const callChatsApi = useCallback(async () => {
    const response = await callApi<ChatsGetResponse>({
      endpoint: `/chats?lastHashId=${lastHashId}`,
    });
    if (response) {
      setChats((prev) => [...(prev ?? []), ...response.chats]);
      if (response.chats.length == 0) {
        setSpinnerHidden(true);
      }
    } else {
      setShouldCallChat(true);
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

export default function Chats() {
  return (
    <Suspense>
      <_Chats />
    </Suspense>
  );
}
