"use client";

import { useCallback, useEffect, useState } from "react";
import callApi from "@/utils/callApi";
import useUserStore from "@/store/user";
import Contents from "@/components/content/Contents";
import ModelSelect from "@/components/selects/ModelSelect";
import ModelResetButton from "@/components/buttons/ModelResetButton";
import ModelSheetButton from "@/components/buttons/ModelSheetButton";
import ModelPanel from "@/components/ModelPanel";
import GpiSaveButton from "@/components/buttons/GpiSaveButton";
import GpiPublicButton from "@/components/buttons/GpiPublicButton";
import useProviderTypes from "@/hooks/useProviderTypes";
import { useRouter } from "next/navigation";
import useModelStore from "@/store/model";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [gpi, setGpi] = useState<GpiGetResponse>();
  const userHashId = useUserStore((state) => state.user?.hashId);

  const [setConfig, setModelHashId] = useModelStore((state) => [
    state.setConfig,
    state.setModelHashId,
  ]);
  const router = useRouter();
  useEffect(() => {
    const callApiApi = async () => {
      const response = await callApi<GpiGetResponse>({
        endpoint: `/gpis/${hashId}`,
        showError: true,
        redirectToMain: true,
      });
      if (response) {
        setGpi(response);
        setConfig(response.config);
        setModelHashId(response.modelHashId);
        if (response.userHashId !== userHashId) {
          alert("You are not allowed to edit this gpi.");
          router.push("/");
        }
      }
    };
    callApiApi();
  }, [hashId, userHashId, router, setConfig, setModelHashId]);

  const setIsPublic = useCallback(
    (isPublic: boolean) =>
      setGpi((prev) => (!prev ? undefined : { ...prev, isPublic })),
    []
  );

  useProviderTypes();

  if (!gpi) return null;
  return (
    <div className="flex-1 grid grid-cols-[1fr_auto] overflow-hidden relative">
      <div className="flex-1 w-full pt-3 px-3 overflow-y-auto">
        <div className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-col gap-3 mb-3">
          <GpiPublicButton
            gpiHashId={gpi.hashId}
            usePublic={[gpi.isPublic, setIsPublic]}
          />
          <ModelSheetButton
            className="md:hidden w-full h-6"
            useGpi={[gpi, setGpi]}
          />
        </div>
        <div className="pb-3 w-full">
          <Contents gpi={gpi} />
        </div>
      </div>
      <ModelPanel topPadding={false}>
        <ModelSelect />
        <ModelResetButton />
        <GpiSaveButton useGpi={[gpi, setGpi]} />
      </ModelPanel>
    </div>
  );
}
