"use client";

import {
  Badge,
  CardContent,
  CardDescription,
  Textarea,
} from "../../components/ui";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CircleX, Cpu, Layers, Loader2, RefreshCcw } from "lucide-react";
import {
  ChatContent,
  ChatContentRefreshSchema,
  ChatContentsDeleteSchema,
  ChatContentUpdateResponse,
  ChatContentsCreateResponse,
  ChatContentCreateSchema,
} from "gpinterface-shared/type/chat-content";
import { Static } from "@sinclair/typebox";
import callApi from "@/utils/callApi";
import { getApiConfig } from "@/utils/model";
import TooltipButton from "../../components/buttons/TooltipButton";
import HistoryDialog from "../../components/dialogs/HistoryDialog";
import useModelStore from "@/store/model";
import ContentInput from "../../components/inputs/ContentInput";
import { cn } from "@/utils/css";
import ContentsCreateButton from "../../components/buttons/ContentsCreateButton";
import { DeleteResponse } from "gpinterface-shared/type";
import { ChatCompletionSchema } from "gpinterface-shared/type/chat";
import {
  GpiGetResponse,
  GpiUpdateResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import IconButton from "../buttons/IconButton";

type ButtonsProps = {
  onClickModel: (() => void) | undefined;
  history: ChatContent["history"];
  isRefreshVisible: boolean;
  onClickRefresh: () => void;
  isDeleteVisible: boolean;
  onClickDelete: () => void;
  disabled: boolean;
  loading: boolean;
};
function Buttons({
  onClickModel,
  history,
  isRefreshVisible,
  onClickRefresh,
  isDeleteVisible,
  onClickDelete,
  disabled,
  loading,
}: ButtonsProps) {
  return (
    <>
      {!!onClickModel && (
        <TooltipButton message="Set this to model">
          <IconButton
            onClick={onClickModel}
            disabled={disabled}
            loading={loading}
            Icon={Cpu}
          />
        </TooltipButton>
      )}
      {!!history && (
        <TooltipButton message="Detail">
          <HistoryDialog history={history}>
            <IconButton Icon={Layers} />
          </HistoryDialog>
        </TooltipButton>
      )}
      {isRefreshVisible && (
        <TooltipButton message="Regenerate">
          <IconButton
            onClick={onClickRefresh}
            disabled={disabled}
            loading={loading}
            Icon={RefreshCcw}
          />
        </TooltipButton>
      )}
      {isDeleteVisible && (
        <TooltipButton message="Delete">
          <IconButton
            variant="icon_destructive"
            onClick={onClickDelete}
            disabled={disabled}
            loading={loading}
            Icon={CircleX}
          />
        </TooltipButton>
      )}
    </>
  );
}

type RefreshingHashId = string | undefined;
type ContentProps = {
  chatContent: Omit<ChatContent, "hashId" | "isModified"> &
    Partial<Pick<ChatContent, "hashId" | "isModified">>;
  setChatContents?: Dispatch<SetStateAction<ChatContent[]>>;
  useRefreshingHashId: [RefreshingHashId, (hashId: RefreshingHashId) => void];
  callUpdateContent: (content: string) => Promise<string | undefined>;
  hashIds?: string[];
};

function Content({
  chatContent,
  setChatContents,
  useRefreshingHashId,
  callUpdateContent,
  hashIds,
}: ContentProps) {
  const [newContent, setNewContent] = useState(chatContent.content);
  const oldContent = useMemo(() => chatContent.content, [chatContent.content]);
  const [refreshingHashId, setRefreshingHashId] = useRefreshingHashId;
  const [model, config, setModelHashId, setConfig] = useModelStore((state) => [
    state.model,
    state.config,
    state.setModelHashId,
    state.setConfig,
  ]);

  useEffect(() => {
    setNewContent(chatContent.content);
  }, [chatContent.content]);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (oldContent === newContent) {
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    const timer = setTimeout(async () => {
      try {
        const response = await callUpdateContent(newContent);
        if (response && setChatContents) {
          setChatContents((prev) =>
            prev.map((p) => {
              if (p.hashId === chatContent.hashId) {
                return { ...p, content: response };
              }
              return p;
            })
          );
        }
      } catch {}

      setIsSaving(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    newContent,
    oldContent,
    callUpdateContent,
    chatContent.hashId,
    setChatContents,
  ]);

  const disabled = useMemo(
    () => typeof refreshingHashId === "string",
    [refreshingHashId]
  );
  const loading = useMemo(
    () =>
      typeof refreshingHashId === "string" &&
      refreshingHashId === chatContent.hashId,
    [refreshingHashId, chatContent.hashId]
  );

  const onClickRefresh = useCallback(async () => {
    if (!model) return;

    setRefreshingHashId(chatContent.hashId);
    const response = await callApi<
      ChatContent,
      Static<typeof ChatContentRefreshSchema>
    >({
      endpoint: `/chat/contents/${chatContent.hashId}/refresh`,
      method: "PATCH",
      body: { config: getApiConfig(model, config), modelHashId: model.hashId },
      showError: true,
    });
    if (response && setChatContents) {
      setChatContents((prev) =>
        prev.map((p) => {
          if (p.hashId === response.hashId) {
            return response;
          }

          return p;
        })
      );
    }
    setRefreshingHashId(undefined);
  }, [chatContent.hashId, model, config, setRefreshingHashId, setChatContents]);

  const isDeleteVisible = useMemo(() => hashIds?.length === 2, [hashIds]);
  const isRefreshVisible = useMemo(
    () => chatContent.role === "assistant",
    [, chatContent.role]
  );
  const onClickDelete = useCallback(async () => {
    if (!hashIds) return;

    let message = `This action will also delete the ${
      chatContent.role === "user" ? "next assistant" : "previous user"
    } message. Do you want to proceed?`;
    const yes = confirm(message);
    if (!yes) return;

    const response = await callApi<
      DeleteResponse,
      Static<typeof ChatContentsDeleteSchema>
    >({
      endpoint: "/chat/contents",
      method: "DELETE",
      body: { hashIds },
      showError: true,
    });
    if (response && setChatContents) {
      setChatContents((prev) =>
        prev.filter((p) => !response.hashIds.includes(p.hashId))
      );
    }
  }, [hashIds, chatContent.role, setChatContents]);

  return (
    <CardContent className="p-0">
      <div className="flex items-end gap-1 mb-1">
        {chatContent.role !== "assistant" && (
          <div className="text-sm">{chatContent.role}</div>
        )}
        {chatContent.role === "assistant" && (
          <div className="text-sm">
            {!chatContent.model ? "assistant" : chatContent.model.name}
          </div>
        )}
        {isSaving && (
          <>
            <Loader2 className="ml-3 animate-spin" />
            <div className="text-xs">saving...</div>
          </>
        )}
        {chatContent.isModified === true && !isSaving && (
          <div className="text-xs underline">*answer modified</div>
        )}
        <div className="flex-1"></div>
        <Buttons
          onClickModel={
            !chatContent.model?.hashId
              ? undefined
              : () => {
                  if (chatContent.model?.hashId) {
                    setModelHashId(chatContent.model?.hashId);
                  }
                  if (chatContent.config) {
                    setConfig(chatContent.config);
                  }
                }
          }
          history={chatContent.history}
          isRefreshVisible={isRefreshVisible === true}
          onClickRefresh={onClickRefresh}
          isDeleteVisible={isDeleteVisible === true}
          onClickDelete={onClickDelete}
          disabled={disabled}
          loading={loading}
        />
      </div>
      <CardDescription>
        <div className="relative">
          <div className="whitespace-pre-wrap px-3 py-2 text-base border rounded-md">
            <div className="min-h-6">{newContent + "."}</div>
          </div>
          <Textarea
            className="absolute max-h-none inset-0 z-10 text-base overflow-hidden resize-none"
            value={newContent}
            onChange={(e) => setNewContent(e.currentTarget.value)}
            placeholder={`${chatContent.role} message`}
            disabled={disabled}
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

type GpiType = GpiGetResponse | undefined;
type ContentsProps = {
  useGpi: [GpiType, Dispatch<SetStateAction<GpiType>>];
  className?: string;
};
export default function Contents({ useGpi, className }: ContentsProps) {
  const [gpi, setGpi] = useGpi;
  const setChatContents = useCallback(
    (value: SetStateAction<GpiGetResponse["chatContents"]>) => {
      setGpi((prev) => {
        if (!prev) return prev;

        if (typeof value === "function") {
          return { ...prev, chatContents: value(prev.chatContents) };
        }
        return { ...prev, chatContents: value };
      });
    },
    [setGpi]
  );
  const chatContents = useMemo(() => gpi?.chatContents, [gpi?.chatContents]);

  const [refreshingHashId, setRefreshingHashId] = useState<string>();

  const systemContent = useMemo(
    () => ({ role: "system", content: gpi?.systemMessage ?? "" }),
    [gpi?.systemMessage]
  );

  const callUpdateSystemMessage = useCallback(
    async (systemMessage: string) => {
      if (!gpi) return;

      const response = await callApi<
        GpiUpdateResponse,
        Static<typeof GpiUpdateSchema>
      >({
        endpoint: `/users/gpis/${gpi.hashId}`,
        method: "PATCH",
        body: { systemMessage },
      });
      return response?.systemMessage;
    },
    [gpi]
  );
  const callUpdateContent = useCallback(
    (hashId: string) => async (content: string) => {
      const response = await callApi<
        ChatContentUpdateResponse,
        Static<typeof ChatCompletionSchema>
      >({
        endpoint: `/chat/contents/${hashId}`,
        method: "PATCH",
        body: { content },
      });
      if (response) {
        setChatContents((prev) =>
          prev.map((c) =>
            c.hashId === hashId ? { ...c, isModified: response.isModified } : c
          )
        );
      }
      return response?.content;
    },
    [setChatContents]
  );

  const [config, model] = useModelStore((state) => [state.config, state.model]);
  const onSubmit = useCallback(
    async (content: string) => {
      if (!gpi || !model) return;

      setRefreshingHashId("");
      const response = await callApi<
        ChatContentsCreateResponse,
        Static<typeof ChatContentCreateSchema>
      >({
        endpoint: `/users/gpis/${gpi.hashId}/chat/contents/completion`,
        method: "POST",
        body: {
          modelHashId: model.hashId,
          content,
          config: getApiConfig(model, config),
        },
        showError: true,
      });
      if (response) {
        setChatContents((prev) => [...prev, ...response]);
      }
      setRefreshingHashId(undefined);
    },
    [gpi, model, config, setChatContents]
  );

  if (!gpi) return null;
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Content
        chatContent={systemContent}
        useRefreshingHashId={[refreshingHashId, setRefreshingHashId]}
        callUpdateContent={callUpdateSystemMessage}
      />
      {chatContents?.map((c, i) => {
        let hashIds: string[] = [];
        if (c.role === "user") {
          hashIds = chatContents?.slice(i, i + 2).map((_c) => _c.hashId);
        } else {
          hashIds = chatContents?.slice(i - 1, i + 1).map((_c) => _c.hashId);
        }

        return (
          <Content
            key={c.hashId}
            chatContent={c}
            setChatContents={setChatContents}
            useRefreshingHashId={[refreshingHashId, setRefreshingHashId]}
            callUpdateContent={callUpdateContent(c.hashId)}
            hashIds={hashIds}
          />
        );
      })}
      <div>
        <div className="flex items-center">
          <div className="text-sm">user</div>
          <div className="flex-1"></div>
          <ContentsCreateButton gpi={gpi} setChatContents={setChatContents} />
        </div>
        <ContentInput onSubmit={onSubmit}></ContentInput>
      </div>
    </div>
  );
}
