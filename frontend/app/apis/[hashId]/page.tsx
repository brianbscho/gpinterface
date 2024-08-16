"use client";

import Api from "@/components/api/Api";
import Provider from "@/components/chat/Provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import Chats from "./Chats";
import Sessions from "./Sessions";
import Document from "./Document";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;

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
            <Provider />
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
