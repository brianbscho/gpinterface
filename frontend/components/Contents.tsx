"use client";

import { Badge, Button, CardContent, CardDescription, Textarea } from "./ui";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CircleX, Cpu, Loader, FileClock, RefreshCcw } from "lucide-react";
import {
  Content as ContentType,
  ContentRefreshSchema,
  ContentsDeleteResponse,
  ContentsDeleteSchema,
  ContentUpdateResponse,
  ContentUpdateSchema,
  ContentsCreateResponse,
  ContentCreateSchema,
} from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import callApi from "@/utils/callApi";
import { getApiConfig } from "@/utils/model";
import SmallHoverButton from "./buttons/SmallHoverButton";
import HistoryDialog from "./dialogs/HistoryDialog";
import useModelStore from "@/store/model";
import {
  ChatUpdateResponse,
  ChatUpdateSchema,
} from "gpinterface-shared/type/chat";
import ContentInput from "./inputs/ContentInput";
import { cn } from "@/utils/css";
import useUserStore from "@/store/user";
import AnswerYourselfButton from "./buttons/AnswerYourselfButton";

type ButtonsProps = {
  onClickModel: () => void;
  history: ContentType["history"];
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
        <SmallHoverButton message="Set this to model">
          <Button
            className="p-1 h-6 w-6"
            variant="default"
            onClick={onClickModel}
            disabled={disabled}
            loading={loading}
          >
            <Cpu />
          </Button>
        </SmallHoverButton>
      )}
      {!!history && (
        <SmallHoverButton message="Detail">
          <HistoryDialog history={history}>
            <Button className="p-1 h-6 w-6" variant="default">
              <FileClock />
            </Button>
          </HistoryDialog>
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
            disabled={disabled}
            loading={loading}
          >
            <CircleX />
          </Button>
        </SmallHoverButton>
      )}
    </>
  );
}

type RefreshingHashId = string | undefined;
type ContentProps = {
  chatHashId: string;
  content: Omit<ContentType, "hashId"> &
    Partial<Omit<ContentType, "role" | "content" | "config" | "model">>;
  setContents: Dispatch<SetStateAction<ContentType[]>>;
  useRefreshingHashId: [RefreshingHashId, (hashId: RefreshingHashId) => void];
  callUpdateContent: (content: string) => Promise<string | undefined>;
  hashIds?: string[];
  editable?: boolean;
  hideButtons?: boolean;
};

function Content({
  chatHashId,
  content,
  setContents,
  useRefreshingHashId,
  callUpdateContent,
  hashIds,
  editable,
  hideButtons,
}: ContentProps) {
  const [newContent, setNewContent] = useState(content.content);
  const [oldContent, setOldContent] = useState(content.content);
  const [refreshingHashId, setRefreshingHashId] = useRefreshingHashId;
  const [model, config, setModelStore] = useModelStore((state) => [
    state.model,
    state.config,
    state.setModelStore,
  ]);

  useEffect(() => {
    setNewContent(content.content);
    setOldContent(content.content);
  }, [content.content]);
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
        {!hideButtons && (
          <Buttons
            onClickModel={() =>
              setModelStore({
                modelHashId: content.model!.hashId,
                config: content.config!,
              })
            }
            history={content.history}
            isRefreshVisible={isRefreshVisible === true}
            onClickRefresh={onClickRefresh}
            isDeleteVisible={isDeleteVisible === true}
            onClickDelete={onClickDelete}
            disabled={disabled}
            loading={loading}
          />
        )}
      </div>
      <CardDescription>
        <div className="relative">
          <div className="whitespace-pre-wrap px-3 py-2 text-base border rounded-md">
            <div className="min-h-6">{newContent + (editable ? "." : "")}</div>
          </div>
          {editable && (
            <Textarea
              className="absolute max-h-none inset-0 z-10 text-base overflow-hidden resize-none"
              value={newContent}
              onChange={(e) => setNewContent(e.currentTarget.value)}
              placeholder={`${content.role} message`}
              disabled={disabled}
            />
          )}
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

type ChatType = {
  hashId: string;
  systemMessage: string;
  contents: ContentType[];
};
type ContentsProps = {
  chat: ChatType;
  gpiHashId?: string;
  ownerUserHashId: string | null | undefined;
  className?: string;
  hideButtons?: boolean;
};
export default function Contents({
  chat,
  gpiHashId,
  ownerUserHashId,
  className,
  hideButtons,
}: ContentsProps) {
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
    () => !ownerUserHashId || ownerUserHashId === userHashId,
    [ownerUserHashId, userHashId]
  );
  const [refreshingHashId, setRefreshingHashId] = useState<string>();

  const [config, model] = useModelStore((state) => [state.config, state.model]);
  const onSubmit = useCallback(
    async (content: string) => {
      if (!model) return;

      setRefreshingHashId("");
      const response = await callApi<
        ContentsCreateResponse,
        Static<typeof ContentCreateSchema>
      >({
        endpoint: `/content`,
        method: "POST",
        body: {
          chatHashId: chat.hashId,
          gpiHashId,
          modelHashId: model.hashId,
          content,
          config: getApiConfig(model, config),
        },
        showError: true,
      });
      if (response) {
        setContents((prev) => [...prev, ...response.contents]);
      }
      setRefreshingHashId(undefined);
    },
    [chat.hashId, gpiHashId, model, config]
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Content
        content={systemContent}
        chatHashId={chat.hashId}
        setContents={setContents}
        useRefreshingHashId={[refreshingHashId, setRefreshingHashId]}
        callUpdateContent={callUpdateSystemMessage}
        editable={editable}
        hideButtons={hideButtons}
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
            useRefreshingHashId={[refreshingHashId, setRefreshingHashId]}
            callUpdateContent={callUpdateContent(c.hashId)}
            hashIds={hashIds}
            editable={editable}
            hideButtons={hideButtons}
          />
        );
      })}
      {editable && (
        <ContentInput onSubmit={onSubmit}>
          <AnswerYourselfButton chat={chat} setContents={setContents} />
        </ContentInput>
      )}
    </div>
  );
}
