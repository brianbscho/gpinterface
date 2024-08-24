"use client";

import callApi from "@/utils/callApi";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChatCreateResponse,
  ChatsGetResponse,
} from "gpinterface-shared/type/chat";
import List from "../List";
import NewChatButton from "../buttons/NewChatButton";
import { useRouter, useSearchParams } from "next/navigation";
import useUserStore from "@/store/user";
import IconTextButton from "../buttons/IconTextButton";
import { ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui";
import Provider from "./Provider";
import Contents from "../Contents";
import DeployButton from "../buttons/DeployButton";

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
  }, [lastHashId, router, chatHashId]);

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
      <div className="absolute top-3 left-3 z-40">
        <NewChatButton setChats={setChats} />
      </div>
      <div className="md:hidden absolute top-3 right-3 z-40">
        <Sheet>
          <SheetTrigger>
            <IconTextButton
              Icon={ChevronLeft}
              text="Models"
              size="small"
              className="w-24"
            />
          </SheetTrigger>
          <SheetContent className="px-0 py-3">
            <Provider />
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-full overflow-y-auto">
        <List
          callApi={callChatsApi}
          emptyMessage="Start your chat!"
          elements={chats}
          spinnerHidden={spinnerHidden}
          useLastHashId={[lastHashId, setLastHashId]}
        >
          {chats?.map((c) => (
            <div
              key={c.hashId}
              className="w-full border-b border-theme pb-0 md:pb-8 mb-12 last:border-none last:mb-0"
            >
              <div className="sticky top-0 md:top-14 pl-[7.5rem] md:pl-3 w-full md:h-0 py-3 md:py-0 bg-background z-30">
                <DeployButton chatHashId={c.hashId} />
              </div>
              <Contents
                chat={c}
                ownerUserHashId={c.userHashId}
                className="pt-0 md:pt-3 px-3 md:pl-[9.5rem] flex flex-col gap-3"
              />
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
