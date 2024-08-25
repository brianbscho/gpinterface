"use client";

import DeployButton from "@/components/buttons/DeployButton";
import ModelResetButton from "@/components/buttons/ModelResetButton";
import ModelSheetButton from "@/components/buttons/ModelSheetButton";
import Contents from "@/components/Contents";
import Model from "@/components/Model";
import ModelSelect from "@/components/selects/ModelSelect";
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
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] overflow-hidden">
      <div className="h-full overflow-y-auto">
        {!!chat && (
          <div className="sticky top-0 md:top-3 px-3 md:h-0 py-3 md:py-0 w-full bg-background z-20 flex">
            <DeployButton chatHashId={chat.hashId} />
            <div className="flex-1"></div>
            <ModelSheetButton className="md:hidden" />
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
      <div className="hidden md:block w-[32rem] h-full relative overflow-hidden">
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-3">
          <ModelSelect />
          <ModelResetButton />
        </div>
        <div className="h-full overflow-y-auto pr-3">
          <Model className="py-3" />
        </div>
      </div>
    </div>
  );
}
