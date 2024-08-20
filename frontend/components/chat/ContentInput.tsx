"use client";

import { CornerDownLeft } from "lucide-react";
import { Badge, Button, CardContent, CardDescription, Textarea } from "../ui";
import {
  Dispatch,
  FormEvent,
  KeyboardEvent,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import callApi from "@/utils/callApi";
import { Content } from "gpinterface-shared/type";
import { Static } from "@sinclair/typebox";
import {
  ContentCreateSchema,
  ContentsGetResponse,
} from "gpinterface-shared/type/content";
import useContentStore from "@/store/content";
import { getApiConfig } from "@/utils/model";
import ContentsDialog from "../api/ContentsDialog";

type Props = {
  chatHashId: string;
  apiHashId?: string;
  setContents: Dispatch<SetStateAction<Content[]>>;
  editable: boolean;
};

export default function ContentInput({
  chatHashId,
  apiHashId,
  setContents,
  editable,
}: Props) {
  const [content, setContent] = useState("");

  const [{ config, model }, setContentStore] = useContentStore((state) => [
    { config: state.config, model: state.model },
    state.setContentStore,
  ]);

  const [responseContents, setResponseContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!model) return;

      setContentStore({ refreshingHashId: "" });
      setLoading(true);
      const response = await callApi<
        ContentsGetResponse,
        Static<typeof ContentCreateSchema>
      >({
        endpoint: `/content`,
        method: "POST",
        body: {
          chatHashId,
          apiHashId,
          modelHashId: model.hashId,
          content,
          config: getApiConfig(model, config),
        },
        showError: true,
      });
      if (response) {
        setContent("");
        setContentStore({ refreshingHashId: undefined });
        setLoading(false);
        if (editable) {
          setContents((prev) => [...prev, ...response.contents]);
        } else {
          setResponseContents(response.contents);
        }
      }
    },
    [
      chatHashId,
      apiHashId,
      model,
      content,
      config,
      setContents,
      setContentStore,
      editable,
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

  return (
    <CardContent className="p-3">
      <div className="flex items-center mb-3">
        <Badge>user</Badge>
      </div>
      <CardDescription>
        <form onSubmit={onSubmit}>
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
                onKeyDown={onKeyDown}
              />
            </div>
            <Button type="submit" loading={loading}>
              <CornerDownLeft />
            </Button>
          </div>
        </form>
      </CardDescription>
      <ContentsDialog useContents={[responseContents, setResponseContents]} />
    </CardContent>
  );
}
