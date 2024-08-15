"use client";

import { CornerDownLeft } from "lucide-react";
import { Badge, Button, CardContent, CardDescription, Textarea } from "../ui";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import { Content } from "gpinterface-shared/type";
import { Static } from "@sinclair/typebox";
import {
  ContentCreateSchema,
  ContentsGetResponse,
} from "gpinterface-shared/type/content";
import useContentStore from "@/store/content";

type Props = {
  chatHashId: string;
  setContents: Dispatch<SetStateAction<Content[]>>;
};

export default function ContentInput({ chatHashId, setContents }: Props) {
  const [content, setContent] = useState("");

  const [{ config, modelHashId }, setContentStore] = useContentStore(
    (state) => [
      { config: state.config, modelHashId: state.model?.hashId },
      state.setContentStore,
    ]
  );
  const [loading, setLoading] = useState(false);
  const onClick = useCallback(async () => {
    if (!modelHashId) return;

    setContentStore({ refreshingHashId: "" });
    setLoading(true);
    const response = await callApi<
      ContentsGetResponse,
      Static<typeof ContentCreateSchema>
    >({
      endpoint: `/content`,
      method: "POST",
      body: { chatHashId, modelHashId, content, config },
    });
    if (response) {
      setContent("");
      setContents((prev) => [...prev, ...response.contents]);
      setContentStore({ refreshingHashId: undefined });
      setLoading(false);
    }
  }, [chatHashId, modelHashId, content, config, setContents, setContentStore]);
  return (
    <CardContent className="p-3">
      <div className="flex items-center mb-3">
        <Badge>user</Badge>
      </div>
      <CardDescription>
        <div className="flex gap-3">
          <div className="relative flex-1 items-start">
            <div className="whitespace-pre-wrap px-3 py-2 text-sm invisible border">
              {content + "."}
            </div>
            <Textarea
              className="absolute max-h-none inset-0 z-10 overflow-hidden resize-none text-slate-300"
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              onFocus={() => setContentStore({ hashId: "" })}
              placeholder="user message"
              disabled={loading}
            />
          </div>
          <Button onClick={onClick} loading={loading}>
            <CornerDownLeft />
          </Button>
        </div>
      </CardDescription>
    </CardContent>
  );
}
