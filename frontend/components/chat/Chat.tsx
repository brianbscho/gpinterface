"use client";

import { useCallback, useMemo, useState } from "react";
import { Card } from "../ui";
import Content from "./Content";
import callApi from "@/utils/callApi";
import {
  ContentUpdateResponse,
  ContentUpdateSchema,
} from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import {
  ChatsGetResponse,
  ChatUpdateResponse,
  ChatUpdateSchema,
} from "gpinterface-shared/type/chat";
import ContentInput from "./ContentInput";
import Deploy from "../api/Deploy";
import useUserStore from "@/store/user";

export default function Chat({ chat }: { chat: ChatsGetResponse["chats"][0] }) {
  const [contents, setContents] = useState(chat.contents);

  const systemContent = useMemo(
    () => ({ role: "system", content: chat.systemMessage }),
    [chat.systemMessage]
  );

  const callUpdateSystemMessage = useCallback(
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
  const callUpdateContent = useCallback(
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

  const userHashId = useUserStore((state) => state.user?.hashId);
  const editable = useMemo(
    () => !chat?.userHashId || chat?.userHashId === userHashId,
    [chat?.userHashId, userHashId]
  );

  return (
    <Card className="w-full mb-12 flex flex-col gap-3">
      <div className="sticky top-[3.25rem] mt-3 ml-3 z-20 w-20">
        <Deploy chatHashId={chat.hashId} />
      </div>
      <Content
        content={systemContent}
        chatHashId={chat.hashId}
        setContents={setContents}
        callUpdateContent={callUpdateSystemMessage}
        editable={editable}
      />
      {contents.map((c, i) => {
        let hashIds: string[] = [];
        if (c.role === "user") {
          hashIds = contents.slice(i, i + 2).map((_c) => _c.hashId);
        } else {
          hashIds = contents.slice(i - 1, i + 1).map((_c) => _c.hashId);
        }

        return (
          <Content
            key={c.hashId}
            content={c}
            chatHashId={chat.hashId}
            setContents={setContents}
            callUpdateContent={callUpdateContent(c.hashId)}
            hashIds={hashIds}
            editable={editable}
          />
        );
      })}
      <ContentInput
        chatHashId={chat.hashId}
        setContents={setContents}
        editable={editable}
      />
    </Card>
  );
}
