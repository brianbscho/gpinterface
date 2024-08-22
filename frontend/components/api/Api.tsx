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
import useUserStore from "@/store/user";
import useModelStore from "@/store/model";

type ApiType = ApiGetResponse;
type ContentsType = ApiType["chat"]["contents"];
type Props = { api: ApiType | undefined; editable: boolean };
export default function Api({ api, editable }: Props) {
  const [models, setModelStore] = useModelStore((state) => [
    state.models,
    state.setModelStore,
  ]);
  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  useEffect(() => {
    if (!api) return;

    const { config } = api;
    setModelStore({ config });
  }, [api, setModelStore]);
  useEffect(() => {
    if (!api) return;

    const { modelHashId } = api;
    const index = models.findIndex(
      (m) =>
        m.isAvailable &&
        m.isFree &&
        (!isLoggedOut || !m.isLoginRequired) &&
        m.hashId === modelHashId
    );
    if (index < 0) return;

    setModelStore({ modelHashId: models[index].hashId });
  }, [api, setModelStore, models, isLoggedOut]);
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
  const [refreshingHashId, setRefreshingHashId] = useState<string>();

  if (!api) return <div></div>;
  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-3 pl-[9.5rem] p-3">
      <Content
        content={systemContent}
        chatHashId={api.chat.hashId}
        setContents={setContents}
        useRefreshingHashId={[refreshingHashId, setRefreshingHashId]}
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
            chatHashId={api.chat.hashId}
            setContents={setContents}
            useRefreshingHashId={[refreshingHashId, setRefreshingHashId]}
            callUpdateContent={callUpdateContent(c.hashId)}
            hashIds={hashIds}
            editable={editable}
          />
        );
      })}
      <ContentInput
        chatHashId={api.chat.hashId}
        apiHashId={api.hashId}
        setContents={setContents}
        setRefreshingHashId={setRefreshingHashId}
        editable={editable}
      />
    </div>
  );
}
