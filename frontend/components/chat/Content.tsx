"use client";

import useConfigStore, { ConfigType } from "@/store/config";
import { Badge, CardContent, CardDescription, Textarea } from "../ui";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "lucide-react";

type Props = {
  content: {
    hashId?: string;
    model?: { hashId: string; name: string };
    role: string;
    content: string;
    config?: ConfigType | null;
  };
  updateContent: (content: string) => Promise<string | undefined>;
};

export default function Content({ content, updateContent }: Props) {
  const [setConfig, setModelHashId] = useConfigStore((state) => [
    state.setConfig,
    state.setModelHashId,
  ]);

  const [newContent, setNewContent] = useState(content.content);
  const [oldContent, setOldContent] = useState(content.content);
  const onFocus = useCallback(() => {
    const { config, model } = content;
    if (config) {
      setConfig(config);
    }
    if (model) {
      setModelHashId(model.hashId);
    }
  }, [content, setConfig, setModelHashId]);

  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (oldContent === newContent) return;

    setIsSaving(true);
    const timer = setTimeout(async () => {
      const responseContent = await updateContent(newContent);
      if (responseContent) {
        setOldContent(responseContent);
      }

      setIsSaving(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [newContent, oldContent, updateContent]);

  return (
    <CardContent className="p-3">
      <div className="flex items-center mb-3">
        <Badge className="">{content.role}</Badge>
        {!!content.model && content.role === "assistant" && (
          <div className="ml-1 text-xs">{content.model.name}</div>
        )}
        {isSaving && (
          <>
            <Loader className="ml-3 animate-spin" />
            <div className="ml-1 text-xs">saving...</div>
          </>
        )}
      </div>
      <CardDescription>
        <div className="relative">
          <div className="whitespace-pre-wrap px-3 py-2 text-sm invisible border">
            {newContent + "."}
          </div>
          <Textarea
            className="absolute max-h-none inset-0 z-10 overflow-hidden resize-none text-slate-300"
            value={newContent}
            onChange={(e) => setNewContent(e.currentTarget.value)}
            placeholder={`${content.role} message`}
            onFocus={onFocus}
          />
        </div>
      </CardDescription>
    </CardContent>
  );
}
