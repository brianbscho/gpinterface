"use client";

import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { FormEvent, KeyboardEvent, useCallback, useState } from "react";
import IconTextButton from "../buttons/IconTextButton";
import {
  CircleX,
  CornerDownLeft,
  FileCode,
  FileCog,
  FileText,
} from "lucide-react";
import useUserStore from "@/store/user";
import Document from "./Document";
import { Badge, Button, CardContent, CardDescription, Textarea } from "../ui";
import callApi from "@/utils/callApi";
import {
  ChatCompletionSampleResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import GpiCopyButton from "../buttons/GpiCopyButton";
import { TestDataType } from "../dialogs/GpiTestDialog";
import Link from "next/link";
import useModelStore from "@/store/model";
import { getApiConfig } from "@/utils/model";
import { stringify } from "@/utils/string";

type StaticContentProps = {
  role: string;
  content: string;
  model?: { name: string } | null;
  isModified?: boolean;
};
function StaticContent({ ...props }: StaticContentProps) {
  const { role, model, isModified, content } = props;
  return (
    <CardContent className="p-0">
      <div className="flex items-center gap-1">
        {role !== "assistant" && <Badge variant="tag">{role}</Badge>}
        {role === "assistant" && (
          <Badge variant="tag">{!model ? "assistant" : model.name}</Badge>
        )}
        {isModified === true && (
          <div className="ml-1 text-xs self-start">*answer modified</div>
        )}
      </div>
      <CardDescription>
        <div className="relative mt-3">
          <div className="whitespace-pre-wrap px-3 py-2 text-base border rounded-md">
            <div className="min-h-6">{content}</div>
          </div>
        </div>
      </CardDescription>
    </CardContent>
  );
}

type Props = {
  gpi: GpiGetResponse;
  setTestData: (testData: TestDataType) => void;
  setTestOpen: (open: boolean) => void;
};
export default function Gpi({ gpi, setTestData, setTestOpen }: Props) {
  const [tab, setTab] = useState<"gpi" | "document">("gpi");
  const getTabContentClassName = useCallback(
    (_tab: string) => {
      const className = "w-full h-full px-3 overflow-hidden";
      if (tab === _tab) return className;
      return className + " hidden";
    },
    [tab]
  );
  const userHashId = useUserStore((state) => state.user?.hashId);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      setLoading(true);
      setTestOpen(true);
      const body = { gpiHashId: gpi.hashId, content };

      const response = await callApi<
        ChatCompletionSampleResponse,
        Static<typeof ChatCompletionSchema>
      >({
        endpoint: "/chat/completion/sample",
        method: "POST",
        body,
        showError: true,
      });
      if (response) {
        setTestData({ userContent: content, ...body, ...response });
      } else {
        setTestData(undefined);
        setTestOpen(false);
      }
      setContent("");
      setLoading(false);
    },
    [gpi.hashId, content, setTestData, setTestOpen]
  );
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit(e);
      }
    },
    [onSubmit]
  );

  const models = useModelStore((state) => state.models);
  const model = models.find((m) => m.hashId === gpi?.modelHashId);

  return (
    <div
      key={gpi.hashId}
      className="w-full border border-theme rounded-md pt-3"
    >
      <div className="whitespace-pre-wrap px-3 pb-3">
        <div>{gpi.description}</div>
        <Badge variant="tag" className="mt-2">
          {model?.name ?? ""}
        </Badge>
        {!!model && Object.keys(gpi.config).length > 0 && (
          <div className="text-sm text-neutral-400 text-wrap mt-1">
            {stringify(getApiConfig(model, gpi.config))}
          </div>
        )}
      </div>
      <div className="sticky top-0 rounded-md w-full px-3 py-3 grid grid-cols-3 md:flex gap-3 bg-background z-30">
        <div className="flex-1 md:flex-initial md:w-32">
          <IconTextButton
            onClick={() => setTab("gpi")}
            className="w-full md:w-32"
            Icon={FileCode}
            text="GPI"
            selected={tab === "gpi"}
            responsive
          />
        </div>
        <div className="flex-1 md:flex-initial md:w-32">
          <IconTextButton
            onClick={() => setTab("document")}
            className="w-full md:w-32"
            Icon={FileText}
            text="Document"
            selected={tab === "document"}
            responsive
          />
        </div>
        <div className="flex-1 md:flex-initial md:w-32">
          <GpiCopyButton gpiHashId={gpi.hashId} />
        </div>
        {gpi.userHashId === userHashId && (
          <div className="flex-1 md:flex-initial md:w-32">
            <Link href={`/chats/${gpi.chat.hashId}`}>
              <IconTextButton
                className="w-full md:w-32"
                Icon={FileCog}
                text="Edit"
                responsive
              />
            </Link>
          </div>
        )}
        {gpi.userHashId === userHashId && (
          <div className="flex-1 md:flex-initial md:w-32">
            <IconTextButton
              className="w-full md:w-32"
              Icon={CircleX}
              variant="icon_destructive"
              text="Delete"
              responsive
            />
          </div>
        )}
      </div>
      <div className={getTabContentClassName("gpi")}>
        <div className="flex flex-col gap-3 mb-3">
          {gpi.chat.systemMessage.length > 0 && (
            <StaticContent role="system" content={gpi.chat.systemMessage} />
          )}
          {gpi.chat.contents.map((content) => (
            <StaticContent key={content.hashId} {...content} />
          ))}
          <div>
            <Badge variant="tag">user</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <form onSubmit={onSubmit}>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 items-start">
                  <div className="whitespace-pre-wrap px-3 py-2 text-base invisible border">
                    {content + "."}
                  </div>
                  <Textarea
                    className="absolute max-h-none inset-0 z-10 text-base overflow-hidden resize-none"
                    value={content}
                    onChange={(e) => setContent(e.currentTarget.value)}
                    placeholder="user message"
                    disabled={loading}
                    onKeyDown={onKeyDown}
                  />
                </div>
                <Button type="submit" loading={loading}>
                  <CornerDownLeft />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className={getTabContentClassName("document")}>
        <Document gpi={gpi} className="px-0 md:pl-0" />
      </div>
    </div>
  );
}
