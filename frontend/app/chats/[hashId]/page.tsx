"use client";

import DeployButton from "@/components/buttons/DeployButton";
import Provider from "@/components/chat/Provider";
import Contents from "@/components/Contents";
import useUserStore from "@/store/user";
import callApi from "@/utils/callApi";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";
import { useEffect, useMemo, useState } from "react";

type ChatType = ChatsGetResponse["chats"][0];
export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [chat, setChat] = useState<ChatType>();
  useEffect(() => {
    const callChatApi = async () => {
      const response = await callApi<ChatType>({
        endpoint: `/chat/${hashId}`,
        showError: true,
      });
      if (response) {
        setChat(response);
      }
    };
    callChatApi();
  }, [hashId]);

  const userHashId = useUserStore((state) => state.user?.hashId);
  const editable = useMemo(
    () => !chat?.userHashId || chat?.userHashId === userHashId,
    [chat?.userHashId, userHashId]
  );

  return (
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] gap-3 overflow-hidden">
      <div className="h-full overflow-y-auto">
        {!!chat && (
          <div className="sticky top-0 md:top-3 pl-3 md:h-0 py-3 md:py-0 w-full bg-background z-20">
            <DeployButton chatHashId={chat.hashId} />
          </div>
        )}
        {!!chat && (
          <Contents
            chat={chat}
            ownerUserHashId={chat.userHashId}
            className="pt-0 md:pt-3 px-3 pl-3 md:pl-[9.5rem] pb-3"
          />
        )}
      </div>
      <div className="hidden md:block w-full h-full relative overflow-hidden">
        <Provider />
      </div>
    </div>
  );
}
