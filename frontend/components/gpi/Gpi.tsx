"use client";

import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { FormEvent, KeyboardEvent, useCallback, useState } from "react";
import IconTextButton from "../buttons/IconTextButton";
import { Bot, CornerDownLeft, FileCode } from "lucide-react";
import ModelSheetButton from "../buttons/ModelSheetButton";
import useUserStore from "@/store/user";
import Contents from "../Contents";
import Document from "./Document";
import { Badge, Button, Textarea } from "../ui";
import callApi from "@/utils/callApi";
import {
  ChatCompletionResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";

type Props = {
  gpi: GpiGetResponse;
  setTestBody: (testBody: { [key: string]: string }) => void;
  setTestResponse: (testResponse: string) => void;
};
export default function Gpi({ gpi, setTestBody, setTestResponse }: Props) {
  const [tab, setTab] = useState<"gpi" | "document">("gpi");
  const getTabContentClassName = useCallback(
    (_tab: string) => {
      const className = "w-full h-full pt-9 md:pt-0 overflow-hidden";
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
      const body = { gpiHashId: gpi.hashId, message: content };
      setTestBody(body);

      const response = await callApi<
        ChatCompletionResponse,
        Static<typeof ChatCompletionSchema>
      >({
        endpoint: "/chat/completion",
        method: "POST",
        body,
      });
      if (response) {
        setTestResponse(JSON.stringify(response, null, 2));
      }
      setContent("");
      setLoading(false);
    },
    [gpi.hashId, content]
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
      className="w-full border border-theme rounded-md p-3 pb-[8.25rem]"
    >
      <div className="whitespace-pre-wrap pb-3">{gpi.description}</div>
      <div className="sticky top-0 md:top-3 w-full md:h-0 py-3 md:py-0 flex md:flex-col gap-3 bg-background z-30">
        <div className="flex-1">
          <IconTextButton
            onClick={() => setTab("gpi")}
            className="w-full md:w-32"
            Icon={Bot}
            text="GPI"
            selected={tab === "gpi"}
            responsive
          />
        </div>
        <div className="flex-1">
          <IconTextButton
            onClick={() => setTab("document")}
            className="w-full md:w-32"
            Icon={FileCode}
            text="Document"
            selected={tab === "document"}
            responsive
          />
        </div>
        <div className="flex-1">
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
          <div className="md:pl-[8.75rem]">
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
        <Document gpi={gpi} />
      </div>
    </div>
  );
}
