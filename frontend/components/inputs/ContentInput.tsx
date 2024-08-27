"use client";

import { CornerDownLeft, PenSquare } from "lucide-react";
import { Badge, Button, Textarea } from "../ui";
import {
  Dispatch,
  FormEvent,
  KeyboardEvent,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import callApi from "@/utils/callApi";
import { Static } from "@sinclair/typebox";
import {
  Content,
  ContentCreateSchema,
  ContentsCreateResponse,
  ContentsCreateSchema,
} from "gpinterface-shared/type/content";
import { getApiConfig } from "@/utils/model";
import SmallHoverButton from "../buttons/SmallHoverButton";
import useModelStore from "@/store/model";

type Props = {
  chatHashId: string;
  gpiHashId?: string;
  setContents: Dispatch<SetStateAction<Content[]>>;
  setRefreshingHashId: (hashId: string | undefined) => void;
};

export default function ContentInput({
  chatHashId,
  gpiHashId,
  setContents,
  setRefreshingHashId,
}: Props) {
  const [content, setContent] = useState("");

  const [config, model] = useModelStore((state) => [state.config, state.model]);

  const [loading, setLoading] = useState(false);
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!model) return;

      setRefreshingHashId("");
      setLoading(true);
      const response = await callApi<
        ContentsCreateResponse,
        Static<typeof ContentCreateSchema>
      >({
        endpoint: `/content`,
        method: "POST",
        body: {
          chatHashId,
          gpiHashId,
          modelHashId: model.hashId,
          content,
          config: getApiConfig(model, config),
        },
        showError: true,
      });
      if (response) {
        setContent("");
        setContents((prev) => [...prev, ...response.contents]);
      }
      setRefreshingHashId(undefined);
      setLoading(false);
    },
    [
      chatHashId,
      gpiHashId,
      model,
      content,
      config,
      setContents,
      setRefreshingHashId,
    ]
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

  const onClickAnswerYourself = useCallback(async () => {
    const response = await callApi<
      ContentsCreateResponse,
      Static<typeof ContentsCreateSchema>
    >({
      method: "POST",
      endpoint: "/contents",
      body: { chatHashId },
    });
    if (response) {
      setContents((prev) => prev.concat(response.contents));
    }
  }, [chatHashId, setContents]);

  return (
    <div className="p-0">
      <div className="flex items-center mb-3">
        <Badge variant="tag" className="h-6">
          user
        </Badge>
        <div className="flex-1"></div>
        <SmallHoverButton message="Answer yourself">
          <Button
            className="p-1 h-6 w-6"
            variant="default"
            loading={loading}
            onClick={onClickAnswerYourself}
          >
            <PenSquare />
          </Button>
        </SmallHoverButton>
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
  );
}
