"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import Content from "../chat/Content";
import ContentInput from "../chat/ContentInput";
import { ApiGetResponse } from "gpinterface-shared/type/api";
import useContentStore from "@/store/content";

type ApiType = ApiGetResponse;
type ContentsType = ApiType["chat"]["contents"];
export default function Api({ api }: { api?: ApiType }) {
  const setContentStore = useContentStore((state) => state.setContentStore);
  useEffect(() => {
    if (api) {
      const { config, modelHashId } = api;
      setContentStore({ config, modelHashId });
    }
  }, [api, setContentStore]);
  const [contents, setContents] = useState<ContentsType>([]);
  useEffect(() => {
    if (!api) return;
    setContents(api.chat.contents);
  }, [api]);

  const systemContent = useMemo(
    () => ({ role: "system", content: api ? api.chat.systemMessage : "" }),
    [api]
  );

  const callUpdateSystemMessage = useCallback(
    async (systemMessage: string) => {
      if (!api) return;

      const response = await callApi<
        ChatUpdateResponse,
        Static<typeof ChatUpdateSchema>
      >({
        endpoint: `/chat/${api.chat.hashId}`,
        method: "PUT",
        body: { systemMessage },
      });
      return response?.systemMessage;
    },
    [api]
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

  if (!api) return null;
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 whitespace-pre-wrap">{api.description}</div>
      <div className="w-full flex flex-col gap-3">
        <Content
          content={systemContent}
          chatHashId={api.chat.hashId}
          setContents={setContents}
          callUpdateContent={callUpdateSystemMessage}
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
              chatHashId={api.chat.hashId}
              setContents={setContents}
              callUpdateContent={callUpdateContent(c.hashId)}
              hashIds={hashIds}
            />
          );
        })}
        <ContentInput chatHashId={api.chat.hashId} setContents={setContents} />
      </div>
    </div>
  );
}
