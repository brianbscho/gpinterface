"use client";

import Chat from "@/components/chat/Chat";
import Provider from "@/components/chat/Provider";
import callApi from "@/utils/callApi";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";
import { useEffect, useState } from "react";

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

  return (
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] gap-3 overflow-hidden">
      <div className="h-full overflow-y-auto pb-3">
        {!!chat && <Chat chat={chat} />}
      </div>
      <Provider />
    </div>
  );
}
