"use client";

import Chat from "@/components/chat/Chat";
import Provider from "@/components/chat/Provider";
import callApi from "@/utils/callApi";
import { Chat as ChatType } from "gpinterface-shared/type";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [chat, setChat] = useState<ChatType>();
  useEffect(() => {
    const callChatApi = async () => {
      const response = await callApi<ChatType>({ endpoint: `/chat/${hashId}` });
      if (response) {
        setChat(response);
      }
    };
    callChatApi();
  }, [hashId]);

  return (
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] gap-3 overflow-hidden">
      <div className="h-full overflow-y-auto">
        {!!chat && <Chat chat={chat} />}
      </div>
      <Provider />
    </div>
  );
}
