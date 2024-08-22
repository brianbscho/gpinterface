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
import { CircleX, Cpu, Loader, ReceiptText, RefreshCcw } from "lucide-react";
import {
  Content as ContentType,
  ContentRefreshSchema,
  ContentsDeleteResponse,
  ContentsDeleteSchema,
} from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import callApi from "@/utils/callApi";
import { getApiConfig } from "@/utils/model";
import SmallHoverButton from "../general/buttons/SmallHoverButton";
import History from "../general/dialogs/History";
import useModelStore from "@/store/model";

type RefreshingHashId = string | undefined;
type Props = {
  chatHashId: string;
  content: Omit<ContentType, "hashId"> &
    Partial<Omit<ContentType, "role" | "content" | "config" | "model">>;
  setContents: Dispatch<SetStateAction<ContentType[]>>;
  useRefreshingHashId: [RefreshingHashId, (hashId: RefreshingHashId) => void];
  callUpdateContent: (content: string) => Promise<string | undefined>;
  hashIds?: string[];
  editable?: boolean;
};

export default function Content({
  chatHashId,
  content,
  setContents,
  useRefreshingHashId,
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

  const [refreshingHashId, setRefreshingHashId] = useRefreshingHashId;
  const [model, config, setModelStore] = useModelStore((state) => [
    state.model,
    state.config,
    state.setModelStore,
  ]);

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
    () => typeof refreshingHashId === "string",
    [refreshingHashId]
  );
  const loading = useMemo(
    () =>
      typeof refreshingHashId === "string" &&
      refreshingHashId === content.hashId,
    [refreshingHashId, content.hashId]
  );

  const onClickRefresh = useCallback(async () => {
    if (!model) return;

    setRefreshingHashId(content.hashId);
    const response = await callApi<
      ContentType,
      Static<typeof ContentRefreshSchema>
    >({
      endpoint: `/content/refresh/${content.hashId}`,
      method: "PUT",
      body: {
        config: getApiConfig(model, config),
        modelHashId: model.hashId,
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
    setRefreshingHashId(undefined);
  }, [chatHashId, content, model, config, setRefreshingHashId, setContents]);

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
    <CardContent className="p-0">
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
        {!!content.model?.hashId && !!content.config && (
          <SmallHoverButton message="Set this to model">
            <Button
              className="p-1 h-6 w-6"
              variant="default"
              onClick={() =>
                setModelStore({
                  modelHashId: content.model!.hashId,
                  config: content.config!,
                })
              }
              loading={loading}
            >
              <Cpu />
            </Button>
          </SmallHoverButton>
        )}
        {!!content.history && (
          <SmallHoverButton message="Detail">
            <History history={content.history}>
              <Button className="p-1 h-6 w-6" variant="default">
                <ReceiptText />
              </Button>
            </History>
          </SmallHoverButton>
        )}
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
            <Button
              className="p-1 h-6 w-6"
              onClick={onClickDelete}
              loading={loading}
            >
              <CircleX />
            </Button>
          </SmallHoverButton>
        )}
      </div>
      <CardDescription>
        <div className="relative">
          <div className="whitespace-pre-wrap px-3 py-2 text-base invisible border">
            {newContent + "."}
          </div>
          <Textarea
            className="absolute max-h-none inset-0 z-10 text-base overflow-hidden resize-none"
            value={newContent}
            onChange={(e) => setNewContent(e.currentTarget.value)}
            placeholder={`${content.role} message`}
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
