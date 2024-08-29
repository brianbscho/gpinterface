"use client";

import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { FormEvent, KeyboardEvent, useCallback, useState } from "react";
import IconTextButton from "../buttons/IconTextButton";
import { CornerDownLeft, FileCode, FileText } from "lucide-react";
import ModelSheetButton from "../buttons/ModelSheetButton";
import useUserStore from "@/store/user";
import Contents from "../Contents";
import Document from "./Document";
import { Badge, Button, Textarea } from "../ui";
import callApi from "@/utils/callApi";
import {
  ChatCompletionSampleResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import GpiCopyButton from "../buttons/GpiCopyButton";

export type TestDataType =
  | {
      gpiHashId: string;
      userContent: string;
      content: string;
      sessionHashId: string;
    }
  | undefined;
type Props = {
  gpi: GpiGetResponse;
  setTestData: (testData: TestDataType) => void;
  setTestOpen: (open: boolean) => void;
};
export default function Gpi({ gpi, setTestData, setTestOpen }: Props) {
  const [tab, setTab] = useState<"gpi" | "document">("gpi");
  const getTabContentClassName = useCallback(
    (_tab: string) => {
      const className = "w-full h-full px-3 pt-9 md:pt-0 overflow-hidden";
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

  return (
    <div
      key={gpi.hashId}
      className="w-full border border-theme rounded-md pt-3"
    >
      <div className="whitespace-pre-wrap px-3 pb-3">{gpi.description}</div>
      <div className="sticky top-0 rounded-md w-full px-3 py-3 grid grid-cols-2 md:flex gap-3 bg-background z-30">
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
        <div className="flex-1 md:flex-initial md:w-32">
          <ModelSheetButton
            className="w-full"
            editable={gpi.userHashId === userHashId}
            disabled
            modelHashId={gpi.modelHashId}
          />
        </div>
      </div>
      <div className={getTabContentClassName("gpi")}>
        {!!gpi && (
          <div>
            <Contents
              chat={gpi.chat}
              gpiHashId={gpi.hashId}
              ownerUserHashId={"non-editable-user"}
              hideButtons
            />
            <div className="flex items-center mt-3">
              <Badge variant="tag" className="h-6">
                user
              </Badge>
            </div>
            <div className="my-3 text-sm text-muted-foreground">
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
        )}
      </div>
      <div className={getTabContentClassName("document")}>
        <Document gpi={gpi} className="px-0 md:pl-0" />
      </div>
    </div>
  );
}
