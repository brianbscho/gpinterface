"use client";

import Document from "./Document";
import { useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/utils/callApi";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import useUserStore from "@/store/user";
import { MessageSquareCode, SquareCode } from "lucide-react";
import IconTextButton from "@/components/buttons/IconTextButton";
import Contents from "@/components/Contents";
import ModelSelect from "@/components/selects/ModelSelect";
import ModelResetButton from "@/components/buttons/ModelResetButton";
import ModelSheetButton from "@/components/buttons/ModelSheetButton";
import EditGpiButtons from "@/components/buttons/EditGpiButtons";
import ModelPanel from "@/components/ModelPanel";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [gpi, setGpi] = useState<GpiGetResponse>();
  useEffect(() => {
    const callApiApi = async () => {
      const response = await callApi<GpiGetResponse>({
        endpoint: `/gpi/${hashId}`,
        showError: true,
      });
      setGpi(response);
    };
    callApiApi();
  }, [hashId]);

  const [tab, setTab] = useState<"gpi" | "document">("gpi");
  const getTabContentClassName = useCallback(
    (_tab: string) => {
      const className = "w-full h-full pt-9 md:pt-0 overflow-hidden";
      if (tab === _tab) return className;
      return className + " hidden";
    },
    [tab]
  );

  const userHashId = useUserStore((state) => state.user?.hashId);
  const editable = useMemo(
    () => !gpi?.userHashId || gpi?.userHashId === userHashId,
    [gpi?.userHashId, userHashId]
  );

  return (
    <div className="w-full flex-1 flex flex-col gap-3 pt-3 overflow-hidden">
      <div className="px-3 whitespace-pre-wrap">{gpi?.description ?? ""}</div>
      <div className="flex-1 grid grid-cols-[1fr_auto] overflow-hidden relative">
        <div className="absolute top-0 left-3 flex md:flex-col gap-3">
          <IconTextButton
            onClick={() => setTab("gpi")}
            className="w-28 md:w-32"
            Icon={MessageSquareCode}
            text="GPI"
            selected={tab === "gpi"}
            responsive
          />
          <IconTextButton
            onClick={() => setTab("document")}
            className="w-28 md:w-32"
            Icon={SquareCode}
            text="Document"
            selected={tab === "document"}
            responsive
          />
        </div>
        <ModelSheetButton
          className="md:hidden absolute h-6 top-0 right-3"
          useGpi={[gpi, setGpi]}
          editable={editable}
        />
        <div className={getTabContentClassName("gpi")}>
          {!!gpi && (
            <div className="md:pl-[9.5rem] px-3 pb-3 w-full h-full overflow-y-auto">
              <Contents
                chat={gpi.chat}
                gpiHashId={gpi.hashId}
                ownerUserHashId={gpi.userHashId}
              />
            </div>
          )}
        </div>
        <div className={getTabContentClassName("document")}>
          <Document gpi={gpi} />
        </div>
        <ModelPanel topPadding={false}>
          <ModelSelect />
          <ModelResetButton />
          {editable && <EditGpiButtons useGpi={[gpi, setGpi]} />}
        </ModelPanel>
      </div>
    </div>
  );
}
