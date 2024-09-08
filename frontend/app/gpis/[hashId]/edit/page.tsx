"use client";

import { useCallback, useEffect, useState } from "react";
import callApi from "@/utils/callApi";
import Contents from "@/components/content/Contents";
import ModelSheetButton from "@/components/buttons/ModelSheetButton";
import ModelPanel from "@/components/ModelPanel";
import GpiSaveButton from "@/components/buttons/GpiSaveButton";
import GpiPublicButton from "@/components/buttons/GpiPublicButton";
import useProviderTypes from "@/hooks/useProviderTypes";
import useModelStore from "@/store/model";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [gpi, setGpi] = useState<GpiGetResponse>();

  const [setConfig, setModelHashId] = useModelStore((state) => [
    state.setConfig,
    state.setModelHashId,
  ]);
  useEffect(() => {
    const callApiApi = async () => {
      const response = await callApi<GpiGetResponse>({
        endpoint: `/users/gpis/${hashId}`,
        showError: true,
        redirectToMain: true,
      });
      if (response) {
        setGpi(response);
        setConfig(response.config);
        setModelHashId(response.modelHashId);
      }
    };
    callApiApi();
  }, [hashId, setConfig, setModelHashId]);

  const setIsPublic = useCallback(
    (isPublic: boolean) =>
      setGpi((prev) => (!prev ? undefined : { ...prev, isPublic })),
    []
  );

  useProviderTypes();

  if (!gpi) return null;
  return (
    <div className="h-full grid grid-cols-[1fr_auto] overflow-hidden relative">
      <div className="h-full w-full pb-3 px-3 overflow-y-auto">
        <div className="z-20 bg-background sticky top-0 py-3 w-full flex gap-3 justify-end">
          <GpiPublicButton
            gpiHashId={gpi.hashId}
            usePublic={[gpi.isPublic, setIsPublic]}
          />
          <ModelSheetButton className="md:hidden w-full" />
          <GpiSaveButton useGpi={[gpi, setGpi]} />
          />
        </div>
        <Contents gpi={gpi} />
      </div>
      <ModelPanel className="hidden md:block w-[32rem]" />
    </div>
  );
}
