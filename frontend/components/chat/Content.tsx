"use client";

import useConfigStore, { ConfigType } from "@/store/config";
import { Badge, CardContent, CardDescription, Textarea } from "../ui";
import { useCallback, useState } from "react";
import { Loader } from "lucide-react";

type Props = {
  content: {
    hashId?: string;
    modelHashId?: string;
    role: string;
    content: string;
    config?: ConfigType | null;
  };
};

export default function Content({ content }: Props) {
  const [setConfig, setModelHashId] = useConfigStore((state) => [
    state.setConfig,
    state.setModelHashId,
  ]);

  const [newContent, setNewContent] = useState(content.content);
  const onFocus = useCallback(() => {
    const { config, modelHashId } = content;
    if (config) {
      setConfig(config);
    }
    if (modelHashId) {
      setModelHashId(modelHashId);
    }
  }, [content, setConfig, setModelHashId]);

  return (
    <CardContent className="p-3">
      <div className="flex items-center mb-3">
        <Badge className="">{content.role}</Badge>
        <Loader className="ml-3 animate-spin" />
        <div className="ml-1 text-xs">saving...</div>
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
