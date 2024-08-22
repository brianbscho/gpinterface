"use client";

import Api from "@/components/api/Api";
import Provider from "@/components/chat/Provider";
import Document from "./Document";
import { useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/utils/callApi";
import { ApiGetResponse } from "gpinterface-shared/type/api";
import { cn } from "@/utils/css";
import useUserStore from "@/store/user";
import EditApi from "./EditApi";
import { MessageSquareCode, SquareCode } from "lucide-react";
import MenuButton from "@/components/general/buttons/MenuButton";

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
    <div className="w-full flex-1 flex flex-col overflow-hidden">
      <div className="p-3 whitespace-pre-wrap">{api?.description ?? ""}</div>
      <div className="flex-1 grid grid-cols-[1fr_auto] overflow-hidden relative">
        <div className="absolute top-3 left-3">
          <MenuButton
            onClick={() => setTab("chat")}
            className="w-32"
            Icon={MessageSquareCode}
            text="Chat"
            selected={tab === "chat"}
          />
        </div>
        <div className="absolute top-14 left-3">
          <MenuButton
            onClick={() => setTab("document")}
            className="w-32"
            Icon={SquareCode}
            text="Document"
            selected={tab === "document"}
          />
        </div>
        <div className={cn("w-full h-full overflow-hidden", isHidden("chat"))}>
          <Api api={api} editable={editable} />
        </div>
        <div
          className={cn("w-full flex-1 overflow-hidden", isHidden("document"))}
        >
          <Document api={api} />
        </div>
        <div className="flex flex-col w-full h-full relative overflow-hidden">
          {editable && (
            <div className="absolute top-[6.25rem] left-3 h-0">
              <EditApi useApi={[api, setApi]} />
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <Provider />
          </div>
        </div>
      </div>
    </div>
  );
}
