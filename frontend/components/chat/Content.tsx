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
import { CircleX, Loader } from "lucide-react";
import { cn } from "@/utils/css";
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
    if (oldContent === newContent) return;

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
    <CardContent className="p-3">
      <div className="flex items-center mb-3">
        <Badge>{content.role}</Badge>
        {!!content.model && content.role === "assistant" && (
          <div className="ml-1 text-xs">{content.model.name}</div>
        )}
        {isSaving && (
          <>
            <Loader className="ml-3 animate-spin" />
            <div className="ml-1 text-xs">saving...</div>
          </>
        )}
        {isRefreshVisible && (
          <Button
            className="ml-3 w-32 text-xs h-auto py-0.5"
            variant="default"
            onClick={onClickRefresh}
            disabled={disabled}
            loading={loading}
          >
            Refresh answer
          </Button>
        )}
        <div className="flex-1"></div>
        {isDeleteVisible && (
          <Button className="p-1 h-6 w-6" onClick={onClickDelete}>
            <CircleX />
          </Button>
        )}
      </div>
      <CardDescription>
        <div className="relative">
          <div className="whitespace-pre-wrap px-3 py-2 text-sm invisible border">
            {newContent + "."}
          </div>
          <Textarea
            className={cn(
              "absolute max-h-none inset-0 z-10 overflow-hidden resize-none text-slate-300",
              content.hashId && contentStore.hashId === content.hashId
                ? "ring-1 ring-ring"
                : ""
            )}
            value={newContent}
            onChange={(e) => setNewContent(e.currentTarget.value)}
            placeholder={`${content.role} message`}
            onFocus={onFocus}
            disabled={disabled || !editable}
          />
          {loading && (
            <div className="absolute inset-0 border z-20 flex items-center justify-center bg-muted rounded-md">
              Refreshing answer...
            </div>
          )}
        </div>
      </CardDescription>
    </CardContent>
  );
}
