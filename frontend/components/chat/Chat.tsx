"use client";

import { useCallback, useMemo, useState } from "react";
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
import SmallHoverButton from "../general/buttons/SmallHoverButton";

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
    <div className="w-full mb-12 border-none px-0">
      <div className="sticky top-3 pl-12 w-full h-0 z-20 bg-background bg-background">
        <div className="h-6 w-6">
          <SmallHoverButton message="Deploy">
            <Deploy chatHashId={chat.hashId} />
          </SmallHoverButton>
        </div>
      </div>
      <div className="pt-3 px-3 pl-[5.25rem] flex flex-col gap-3">
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
      </div>
    </div>
  );
}
