"use client";

import { Chat as ChatType } from "gpinterface-shared/type";
import { useCallback, useMemo } from "react";
import { Card } from "../ui";
import Content from "./Content";
import callApi from "@/utils/callApi";
import {
  ContentUpdateResponse,
  ContentUpdateSchema,
} from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import {
  ChatUpdateResponse,
  ChatUpdateSchema,
} from "gpinterface-shared/type/chat";

export default function Chat({ chat }: { chat: ChatType }) {
  const contents = useMemo(() => chat.contents, [chat.contents]);

  const systemContent = useMemo(
    () => ({ role: "system", content: chat.systemMessage }),
    [chat.systemMessage]
  );

  const updateSystemMessage = useCallback(
    async (systemMessage: string) => {
      const response = await callApi<
        ChatUpdateResponse,
        Static<typeof ChatUpdateSchema>
      >({
        endpoint: `/chat/${chat.hashId}`,
        method: "PUT",
        body: { systemMessage },
      });
      return response?.systemMessage;
    },
    [chat.hashId]
  );
  const updateContent = useCallback(
    (hashId: string) => async (content: string) => {
      const response = await callApi<
        ContentUpdateResponse,
        Static<typeof ContentUpdateSchema>
      >({
        endpoint: `/content/${hashId}`,
        method: "PUT",
        body: { content },
      });
      return response?.content;
    },
    []
  );

  return (
    <Card className="w-full mb-3 flex flex-col gap-3">
      <Content content={systemContent} updateContent={updateSystemMessage} />
      {contents.map((c) => (
        <Content
          key={c.hashId}
          content={c}
          updateContent={updateContent(c.hashId)}
        />
      ))}
    </Card>
  );
}
