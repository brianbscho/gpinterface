"use client";

import Document from "./Document";
import { useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/utils/callApi";
import { ApiGetResponse } from "gpinterface-shared/type/api";
import { cn } from "@/utils/css";
import useUserStore from "@/store/user";
import { ChevronLeft, MessageSquareCode, SquareCode } from "lucide-react";
import IconTextButton from "@/components/buttons/IconTextButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui";
import Contents from "@/components/Contents";
import ModelSelect from "@/components/selects/ModelSelect";
import ModelResetButton from "@/components/buttons/ModelResetButton";
import Model from "@/components/Model";
import EditApiButtons from "@/components/buttons/EditApiButtons";

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

  const [tab, setTab] = useState("chat");
  const isHidden = useCallback(
    (_tab: string) => (tab === _tab ? "" : "hidden"),
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
        <div className="absolute top-0 left-3">
          <IconTextButton
            onClick={() => setTab("chat")}
            className="w-24 md:w-32"
            Icon={MessageSquareCode}
            text="Chat"
            selected={tab === "chat"}
            responsive
          />
        </div>
        <div className="absolute top-0 md:top-[2.75rem] left-[7.5rem] md:left-3">
          <IconTextButton
            onClick={() => setTab("document")}
            className="w-28 md:w-32"
            Icon={SquareCode}
            text="Document"
            selected={tab === "document"}
            responsive
          />
        </div>
        <div className="md:hidden absolute top-0 right-3">
          <Sheet>
            <SheetTrigger>
              <IconTextButton
                Icon={ChevronLeft}
                text="Models"
                size="small"
                className="w-24"
              />
            </SheetTrigger>
            <SheetContent className="p-0">
              <div className="w-full h-full overflow-y-auto relative">
                <div className="w-full sticky top-0 px-3 py-3 z-30 grid grid-cols-2 gap-3 bg-background">
                  <div className="w-full">
                    <ModelSelect />
                  </div>
                  <ModelResetButton />
                  {editable && <EditApi useApi={[api, setApi]} />}
                </div>
                <div className="h-full px-3">
                  <Model className="pb-3" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div
          className={cn(
            "w-full h-full pt-9 md:pt-0 overflow-hidden",
            isHidden("chat")
          )}
        >
          {!!api && (
            <Contents
              chat={api.chat}
              apiHashId={api.hashId}
              ownerUserHashId={api.userHashId}
              className="md:pl-[9.5rem] px-3 pb-3 w-full h-full overflow-y-auto"
            />
          )}
        </div>
        <div
          className={cn(
            "w-full flex-1 pt-9 md:pt-0 overflow-hidden",
            isHidden("document")
          )}
        >
          <Document api={api} />
        </div>
        <div className="hidden md:block w-full h-full relative overflow-hidden">
          <div className="h-full w-[32rem] overflow-hidden">
            <div className="absolute top-0 left-3 z-30 flex flex-col gap-3">
              <ModelSelect />
              <ModelResetButton />
              {editable && <EditApiButtons useApi={[api, setApi]} />}
            </div>
            <div className="h-full overflow-y-auto pr-3">
              <Model className="pb-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
