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
import { Loader } from "lucide-react";
import { cn } from "@/utils/css";
import useContentStore from "@/store/content";
import { Content as ContentType } from "gpinterface-shared/type";
import { ContentRefreshSchema } from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import callApi from "@/utils/callApi";

type Props = {
  chatHashId: string;
  content: Omit<ContentType, "hashId" | "model"> &
    Partial<Omit<ContentType, "role" | "content" | "confing">>;
  setContents: Dispatch<SetStateAction<ContentType[]>>;
  callUpdateContent: (content: string) => Promise<string | undefined>;
};

export default function Content({
  chatHashId,
  content,
  setContents,
  callUpdateContent,
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
    if (content.config && content.model) {
      setContentStore({ config: content.config, model: content.model });
    }
  }, [content, contentStore.hashId, setContentStore]);

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
        config: contentStore.config,
        modelHashId: contentStore.model.hashId,
        chatHashId,
      },
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
        {content.role === "assistant" && (
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
            disabled={disabled}
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
