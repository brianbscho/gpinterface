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

type ApiType = ApiGetResponse["api"];
type ContentsType = ApiType["chat"]["contents"];
export default function Api({ hashId }: { hashId: string }) {
  const [api, setApi] = useState<ApiType>();
  useEffect(() => {
    const callApiApi = async () => {
      const response = await callApi<ApiGetResponse>({
        endpoint: `/api/${hashId}`,
      });
      if (response) {
        setApi(response.api);
      }
    };
    callApiApi();
  }, [hashId]);

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
      <div className="w-full flex flex-col gap-3">
        <Content
          content={systemContent}
          chatHashId={api.chat.hashId}
          setContents={setContents}
          callUpdateContent={callUpdateSystemMessage}
        />
        {contents.map((c) => (
          <Content
            key={c.hashId}
            content={c}
            chatHashId={api.chat.hashId}
            setContents={setContents}
            callUpdateContent={callUpdateContent(c.hashId)}
          />
        ))}
        <ContentInput chatHashId={api.chat.hashId} setContents={setContents} />
      </div>
    </div>
  );
}
