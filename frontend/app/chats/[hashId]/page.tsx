"use client";

import { useCallback, useEffect, useState } from "react";
import callApi from "@/utils/callApi";
import useUserStore from "@/store/user";
import Contents from "@/components/Contents";
import ModelSelect from "@/components/selects/ModelSelect";
import ModelResetButton from "@/components/buttons/ModelResetButton";
import ModelSheetButton from "@/components/buttons/ModelSheetButton";
import ModelPanel from "@/components/ModelPanel";
import GpiSaveButton from "@/components/buttons/GpiSaveButton";
import GpiPublicButton from "@/components/buttons/GpiPublicButton";
import useProviderTypes from "@/hooks/useProviderTypes";
import { useRouter } from "next/navigation";
import { ChatGetResponse } from "gpinterface-shared/type/chat";
import useModelStore from "@/store/model";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [chat, setChat] = useState<ChatGetResponse>();
  const userHashId = useUserStore((state) => state.user?.hashId);

  const [setConfig, setModelHashId] = useModelStore((state) => [
    state.setConfig,
    state.setModelHashId,
  ]);
  const router = useRouter();
  useEffect(() => {
    const callApiApi = async () => {
      const response = await callApi<ChatGetResponse>({
        endpoint: `/chat/${hashId}`,
        showError: true,
        redirectToMain: true,
      });
      if (response) {
        setChat(response);
        if (response.gpis.length > 0) {
          setConfig(response.gpis[0].config);
          setModelHashId(response.gpis[0].modelHashId);
        }
        if (response.userHashId !== userHashId) {
          alert("You are not allowed to edit this chat.");
          router.push("/");
        }
      }
    };
    callApiApi();
  }, [hashId, userHashId, router, setConfig, setModelHashId]);

  const setIsPublic = useCallback(
    (isPublic: boolean) =>
      setChat((prev) =>
        !prev
          ? undefined
          : { ...prev, gpis: prev.gpis.map((gpi) => ({ ...gpi, isPublic })) }
      ),
    []
  );
  const setGpi = useCallback((gpi: ChatGetResponse["gpis"][0] | undefined) => {
    if (!gpi) return;

    setChat((prev) => (!prev ? undefined : { ...prev, gpis: [gpi] }));
  }, []);

  useProviderTypes();

  if (!chat) return null;
  return (
    <div className="w-full flex-1 flex flex-col gap-3 overflow-hidden">
      <div className="flex-1 grid grid-cols-[1fr_auto] overflow-hidden relative">
        <div className="flex-1 w-full pt-3 px-3 overflow-y-auto">
          <div className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-col gap-3 mb-3">
            {chat.gpis.length > 0 && (
              <GpiPublicButton
                gpiHashId={chat.gpis[0].hashId}
                usePublic={[chat.gpis[0].isPublic, setIsPublic]}
              />
            )}
            <ModelSheetButton
              className="md:hidden w-full h-6"
              useGpi={[chat.gpis[0], setGpi]}
            />
          </div>
          <div className="pb-3 w-full">
            <Contents chat={chat} />
          </div>
        </div>
        <ModelPanel topPadding={false}>
          <ModelSelect />
          <ModelResetButton />
          <GpiSaveButton useGpi={[chat.gpis[0], setGpi]} />
        </ModelPanel>
      </div>
    </div>
  );
}
