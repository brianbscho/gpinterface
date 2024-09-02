"use client";

import { useEffect, useMemo, useState } from "react";
import callApi from "@/utils/callApi";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
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

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [gpi, setGpi] = useState<GpiGetResponse>();
  const userHashId = useUserStore((state) => state.user?.hashId);
  const router = useRouter();
  useEffect(() => {
    const callApiApi = async () => {
      const response = await callApi<GpiGetResponse>({
        endpoint: `/gpi/${hashId}`,
        showError: true,
        redirectToMain: true,
      });
      if (response) {
        setGpi(response);
        if (response.userHashId !== userHashId) {
          alert("You are not allowed to edit this gpi.");
          router.push("/");
        }
      }
    };
    callApiApi();
  }, [hashId, userHashId, router]);

  const editable = useMemo(
    () =>
      !!gpi?.userHashId && (!gpi?.userHashId || gpi?.userHashId === userHashId),
    [gpi?.userHashId, userHashId]
  );

  useProviderTypes();

  if (!gpi) return null;

  return (
    <div className="w-full flex-1 flex flex-col gap-3 pt-3 overflow-hidden">
      <div className="px-3 whitespace-pre-wrap">{gpi?.description ?? ""}</div>
      <div className="flex-1 grid grid-cols-[1fr_auto] overflow-hidden relative">
        <div className="flex-1 w-full px-3 overflow-y-auto">
          <div className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-col gap-3 mb-3">
            {editable && <GpiPublicButton useGpi={[gpi, setGpi]} />}
            <ModelSheetButton
              className="md:hidden w-full h-6"
              useGpi={[gpi, setGpi]}
              editable={editable}
            />
          </div>
          <div className="pb-3 w-full">
            <Contents
              chat={gpi.chat}
              gpiHashId={gpi.hashId}
              ownerUserHashId={gpi.userHashId}
            />
          </div>
        </div>
        <ModelPanel topPadding={false}>
          <ModelSelect />
          <ModelResetButton />
          {editable && <GpiSaveButton useGpi={[gpi, setGpi]} />}
        </ModelPanel>
      </div>
    </div>
  );
}
