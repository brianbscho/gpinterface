"use client";

import Document from "./Document";
import { useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/utils/callApi";
import { ApiGetResponse } from "gpinterface-shared/type/api";
import useUserStore from "@/store/user";
import { MessageSquareCode, SquareCode } from "lucide-react";
import IconTextButton from "@/components/buttons/IconTextButton";
import Contents from "@/components/Contents";
import ModelSelect from "@/components/selects/ModelSelect";
import ModelResetButton from "@/components/buttons/ModelResetButton";
import ModelSheetButton from "@/components/buttons/ModelSheetButton";
import EditApiButtons from "@/components/buttons/EditApiButtons";
import ModelPanel from "@/components/ModelPanel";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [api, setApi] = useState<ApiGetResponse>();
  useEffect(() => {
    const callApiApi = async () => {
      const response = await callApi<ApiGetResponse>({
        endpoint: `/api/${hashId}`,
        showError: true,
      });
      setApi(response);
    };
    callApiApi();
  }, [hashId]);

  const [tab, setTab] = useState("api");
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
    () => !api?.userHashId || api?.userHashId === userHashId,
    [api?.userHashId, userHashId]
  );

  return (
    <div className="w-full flex-1 flex flex-col gap-3 pt-3 overflow-hidden">
      <div className="px-3 whitespace-pre-wrap">{api?.description ?? ""}</div>
      <div className="flex-1 grid grid-cols-[1fr_auto] overflow-hidden relative">
        <div className="absolute top-0 left-3 flex md:flex-col gap-3">
          <IconTextButton
            onClick={() => setTab("api")}
            className="w-24 md:w-32"
            Icon={MessageSquareCode}
            text="API"
            selected={tab === "api"}
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
          useApi={[api, setApi]}
          editable={editable}
        />
        <div className={getTabContentClassName("api")}>
          {!!api && (
            <Contents
              chat={api.chat}
              apiHashId={api.hashId}
              ownerUserHashId={api.userHashId}
              className="md:pl-[9.5rem] px-3 pb-3 w-full h-full overflow-y-auto"
            />
          )}
        </div>
        <div className={getTabContentClassName("document")}>
          <Document api={api} />
        </div>
        <ModelPanel topPadding={false}>
          <ModelSelect />
          <ModelResetButton />
          {editable && <EditApiButtons useApi={[api, setApi]} />}
        </ModelPanel>
      </div>
    </div>
  );
}
