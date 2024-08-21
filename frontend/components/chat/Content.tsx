"use client";

import { Badge, Button, CardContent, CardDescription, Textarea } from "../ui";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CircleX, Loader, RefreshCcw } from "lucide-react";
import useContentStore from "@/store/content";
import { Content as ContentType } from "gpinterface-shared/type";
import {
  ContentRefreshSchema,
  ContentsDeleteResponse,
  ContentsDeleteSchema,
} from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import callApi from "@/utils/callApi";
import { getApiConfig } from "@/utils/model";
import SmallHoverButton from "../general/buttons/SmallHoverButton";

type Props = {
  chatHashId: string;
  content: Omit<ContentType, "hashId" | "model"> &
    Partial<Omit<ContentType, "role" | "content" | "confing">>;
  setContents: Dispatch<SetStateAction<ContentType[]>>;
  callUpdateContent: (content: string) => Promise<string | undefined>;
  hashIds?: string[];
  editable?: boolean;
};

export default function Content({
  chatHashId,
  content,
  setContents,
  callUpdateContent,
  hashIds,
  editable,
}: Props) {
  const [newContent, setNewContent] = useState(content.content);
  const [oldContent, setOldContent] = useState(content.content);
  useEffect(() => {
    setNewContent(content.content);
    setOldContent(content.content);
  }, [content.content]);

  const [isSaving, setIsSaving] = useState(false);

  const [contentStore, setContentStore] = useContentStore((state) => {
    const { setContentStore, ...contentStore } = state;
    return [contentStore, setContentStore];
  });

  useEffect(() => {
    if (oldContent === newContent) {
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    const timer = setTimeout(async () => {
      try {
        const response = await callUpdateContent(newContent);
        if (response) {
          setOldContent(response);
        }
      } catch {}

      setIsSaving(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [newContent, oldContent, callUpdateContent]);

  const disabled = useMemo(
    () => typeof contentStore.refreshingHashId === "string",
    [contentStore.refreshingHashId]
  );
  const loading = useMemo(
    () =>
      typeof contentStore.refreshingHashId === "string" &&
      contentStore.refreshingHashId === content.hashId,
    [contentStore.refreshingHashId, content.hashId]
  );

  const onFocus = useCallback(() => {
    if (content.hashId === contentStore.hashId) return;

    setContentStore({ hashId: content.hashId });
    if (content.config) {
      setContentStore({ config: content.config });
    }
    if (content.model && content.model.hashId !== contentStore.modelHashId) {
      setContentStore({
        modelHashId: content.model.hashId,
      });
    }
  }, [content, contentStore, setContentStore]);

  const onClickRefresh = useCallback(async () => {
    if (!contentStore.model) return;

    setContentStore({ refreshingHashId: content.hashId });
    const response = await callApi<
      ContentType,
      Static<typeof ContentRefreshSchema>
    >({
      endpoint: `/content/refresh/${content.hashId}`,
      method: "PUT",
      body: {
        config: getApiConfig(contentStore.model, contentStore.config),
        modelHashId: contentStore.model.hashId,
        chatHashId,
      },
      showError: true,
    });
    if (response) {
      setContents((prev) =>
        prev.map((p) => {
          if (p.hashId === response.hashId) {
            return response;
          }

          return p;
        })
      );
    }
    setContentStore({ refreshingHashId: undefined });
  }, [chatHashId, content, contentStore, setContentStore, setContents]);

  const isDeleteVisible = useMemo(
    () => hashIds?.length === 2 && editable,
    [hashIds, editable]
  );
  const isRefreshVisible = useMemo(
    () => content.role === "assistant" && editable,
    [, content.role, editable]
  );
  const onClickDelete = useCallback(async () => {
    if (!hashIds || !editable) return;

    let message = `This action will also delete the ${
      content.role === "user" ? "next assistant" : "previous user"
    } message. Do you want to proceed?`;
    const yes = confirm(message);
    if (!yes) return;

    const response = await callApi<
      ContentsDeleteResponse,
      Static<typeof ContentsDeleteSchema>
    >({
      endpoint: "/contents",
      method: "DELETE",
      body: { hashIds },
      showError: true,
    });
    if (response?.success) {
      setContents((prev) => prev.filter((p) => !hashIds.includes(p.hashId)));
    }
  }, [hashIds, editable, content.role, setContents]);

  return (
    <CardContent className="p-0 px-3">
      <div className="flex items-center gap-1 mb-3">
        {content.role !== "assistant" && (
          <Badge className="h-6" variant="tag">
            {content.role}
          </Badge>
        )}
        {content.role === "assistant" && (
          <Badge className="h-6" variant="tag">
            {!content.model ? "assistant" : content.model.name}
          </Badge>
        )}
        {isSaving && (
          <>
            <Loader className="ml-3 animate-spin" />
            <div className="text-xs">saving...</div>
          </>
        )}
        <div className="flex-1"></div>
        {isRefreshVisible && (
          <SmallHoverButton message="Regenerate">
            <Button
              className="p-1 h-6 w-6"
              variant="default"
              onClick={onClickRefresh}
              disabled={disabled}
              loading={loading}
            >
              <RefreshCcw />
            </Button>
          </SmallHoverButton>
        )}
        {isDeleteVisible && (
          <SmallHoverButton message="Delete">
            <Button className="p-1 h-6 w-6" onClick={onClickDelete}>
              <CircleX />
            </Button>
          </SmallHoverButton>
        )}
      </div>
      <CardDescription>
        <div className="relative">
          <div className="whitespace-pre-wrap px-3 py-2 text-sm invisible border">
            {newContent + "."}
          </div>
          <Textarea
            className="absolute max-h-none inset-0 z-10 overflow-hidden resize-none"
            value={newContent}
            onChange={(e) => setNewContent(e.currentTarget.value)}
            placeholder={`${content.role} message`}
            onFocus={onFocus}
            disabled={disabled || !editable}
          />
          {loading && (
            <div className="absolute inset-0 border z-20 flex items-center justify-center rounded-md">
              Refreshing answer...
            </div>
          )}
        </div>
      </CardDescription>
    </CardContent>
  );
}
