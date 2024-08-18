"use client";

import Api from "@/components/api/Api";
import Provider from "@/components/chat/Provider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui";
import Chats from "./Chats";
import Sessions from "./Sessions";
import Document from "./Document";
import { useCallback, useEffect, useMemo, useState } from "react";
import callApi from "@/utils/callApi";
import { ApiGetResponse } from "gpinterface-shared/type/api";
import { cn } from "@/utils/css";
import useUserStore from "@/store/user";
import EditApi from "./EditApi";

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

  const [tab, setTab] = useState("document");
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
    <div className="w-full flex-1 overflow-hidden">
      <Tabs
        className="w-full h-full flex flex-col overflow-hidden"
        value={tab}
        onValueChange={setTab}
      >
        <TabsList className="w-full rounded-none">
          <TabsTrigger value="document" className="flex-1">
            Document
          </TabsTrigger>
          <TabsTrigger value="api" className="flex-1">
            API
          </TabsTrigger>
          <TabsTrigger value="chat_completions" className="flex-1">
            Chat completions
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1">
            Sessions
          </TabsTrigger>
        </TabsList>
        <div className={cn("w-full flex-1 overflow-hidden", isHidden("api"))}>
          <div className="h-full grid grid-cols-[1fr_auto] overflow-hidden">
            <Api api={api} editable={editable} />
            <div className="flex flex-col w-full h-full overflow-hidden">
              {editable && <EditApi useApi={[api, setApi]} />}
              <div className="flex-1 overflow-hidden">
                <Provider />
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "w-full flex-1 overflow-y-auto",
            isHidden("chat_completions")
          )}
        >
          <Chats apiHashId={hashId} />
        </div>
        <div
          className={cn("w-full flex-1 overflow-y-auto", isHidden("sessions"))}
        >
          <Sessions apiHashId={hashId} />
        </div>
        <div
          className={cn("w-full flex-1 overflow-y-auto", isHidden("document"))}
        >
          <Document api={api} />
        </div>
      </Tabs>
    </div>
  );
}
