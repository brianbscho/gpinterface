"use client";

import DeployButton from "@/components/buttons/DeployButton";
import ModelResetButton from "@/components/buttons/ModelResetButton";
import ModelSheetButton from "@/components/buttons/ModelSheetButton";
import Contents from "@/components/Contents";
import ModelPanel from "@/components/ModelPanel";
import ModelSelect from "@/components/selects/ModelSelect";
import useProviderTypes from "@/hooks/useProviderTypes";
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
        redirectToMain: true,
      });
      if (response) {
        setChat(response);
      }
    };
    callChatApi();
  }, [hashId]);

  useProviderTypes();

  if (!chat) return null;

  return (
    <div className="w-full flex-1 grid grid-cols-[1fr_auto] overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="sticky top-0 md:top-3 px-3 md:h-0 py-3 md:py-0 w-full bg-background z-20 flex">
          <DeployButton chatHashId={chat.hashId} />
          <div className="flex-1"></div>
          <ModelSheetButton className="md:hidden w-24" />
        </div>
        <Contents
          chat={chat}
          ownerUserHashId={chat.userHashId}
          className="pt-0 md:pt-3 px-3 pl-3 md:pl-[9.5rem] pb-3"
        />
      </div>
      <ModelPanel>
        <ModelSelect />
        <ModelResetButton />
      </ModelPanel>
    </div>
  );
}
