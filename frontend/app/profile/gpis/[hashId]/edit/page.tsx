"use client";

import { useCallback, useEffect, useState } from "react";
import callApi from "@/utils/callApi";
import Contents from "@/components/content/Contents";
import ModelSheetButton from "@/components/buttons/ModelSheetButton";
import ModelPanel from "@/components/ModelPanel";
import useProviderTypes from "@/hooks/useProviderTypes";
import useModelStore from "@/store/model";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import IconTextButton from "@/components/buttons/IconTextButton";
import { CircleX } from "lucide-react";
import { DeleteResponse } from "gpinterface-shared/type";
import GpiDeployButton from "@/components/buttons/GpiDeployButton";

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

  const onClickDelete = useCallback(async () => {
    if (!gpi) return;

    const yes = confirm(
      "Are you sure you want to delete this? This action cannot be undone."
    );
    if (!yes) return;

    const response = await callApi<DeleteResponse>({
      endpoint: `/users/gpis/${gpi.hashId}`,
      method: "DELETE",
      showError: true,
    });
    if (response) {
      location.pathname = "/profile/gpis";
    }
  }, [gpi]);

  useProviderTypes();

  if (!gpi) return null;
  return (
    <div className="h-full grid grid-cols-[1fr_auto] overflow-hidden relative">
      <div className="h-full w-full pb-3 px-3 overflow-y-auto">
        <div className="z-20 bg-background sticky top-0 py-3 w-full flex gap-3 justify-end">
          <ModelSheetButton className="md:hidden" />
          <GpiDeployButton
            gpiHashId={gpi.hashId}
            chatContents={[
              { role: "system", content: gpi.systemMessage },
            ].concat(gpi.chatContents)}
            isSave={gpi.isDeployed}
          />
          <IconTextButton
            onClick={onClickDelete}
            Icon={CircleX}
            variant="icon_destructive"
            text="Delete"
            responsive
          />
        </div>
        <Contents useGpi={[gpi, setGpi]} />
      </div>
      <ModelPanel className="hidden md:block w-[32rem]" />
    </div>
  );
}
