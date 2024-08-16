"use client";

import Api from "@/components/api/Api";
import Provider from "@/components/chat/Provider";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "@/components/ui";
import Chats from "./Chats";
import Sessions from "./Sessions";
import Document from "./Document";
import { useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import {
  ApiCreateResponse,
  ApiUpdateSchema,
} from "gpinterface-shared/type/api";
import useContentStore from "@/store/content";
import { getApiConfig } from "@/utils/model";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;

  const { toast } = useToast();
  const [config, model] = useContentStore((state) => [
    state.config,
    state.model,
  ]);
  const onClickDefault = useCallback(async () => {
    if (!model) return;

    const response = await callApi<
      ApiCreateResponse,
      Static<typeof ApiUpdateSchema>
    >({
      endpoint: `/api/${hashId}`,
      method: "PUT",
      body: { modelHashId: model.hashId, config: getApiConfig(model, config) },
      showError: true,
    });
    if (response) {
      toast({ title: "Saved!", duration: 1000 });
    }
  }, [hashId, model, config, toast]);

  return (
    <div className="w-full flex-1 overflow-hidden">
      <Tabs
        className="w-full h-full flex flex-col overflow-hidden"
        defaultValue="api"
      >
        <TabsList className="w-full">
          <TabsTrigger value="api" className="flex-1">
            API
          </TabsTrigger>
          <TabsTrigger value="chat_completion" className="flex-1">
            Chat completions
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1">
            Sessions
          </TabsTrigger>
          <TabsTrigger value="document" className="flex-1">
            Document
          </TabsTrigger>
        </TabsList>
        <TabsContent value="api" className="w-full flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-[1fr_auto] overflow-hidden">
            <Api hashId={hashId} />
            <div className="flex flex-col w-full h-full overflow-hidden">
              <Button
                className="w-full rounded-none"
                variant="outline"
                onClick={onClickDefault}
              >
                Set as default model
              </Button>
              <div className="flex-1 overflow-hidden">
                <Provider />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="chat_completion"
          className="w-full flex-1 overflow-y-auto"
        >
          <Chats apiHashId={hashId} />
        </TabsContent>
        <TabsContent value="sessions" className="w-full flex-1 overflow-y-auto">
          <Sessions apiHashId={hashId} />
        </TabsContent>
        <TabsContent value="document" className="w-full flex-1 overflow-y-auto">
          <Document apiHashId={hashId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
