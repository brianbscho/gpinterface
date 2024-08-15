"use client";

import { CornerDownLeft } from "lucide-react";
import { Badge, Button, CardContent, CardDescription, Textarea } from "../ui";
import { useState } from "react";
import useConfigStore from "@/store/config";

type Props = {
  setFocusedContentHashId: (hashId: string) => void;
};

export default function ContentInput({ setFocusedContentHashId }: Props) {
  const { config, setConfig, modelHashId, setModelHashId } = useConfigStore();

  const [content, setContent] = useState("");

  return (
    <CardContent className="p-3">
      <div className="flex items-center mb-3">
        <Badge>user</Badge>
      </div>
      <CardDescription>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="whitespace-pre-wrap px-3 py-2 text-sm invisible border">
              {content + "."}
            </div>
            <Textarea
              className="absolute max-h-none inset-0 z-10 overflow-hidden resize-none text-slate-300"
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              onFocus={() => setFocusedContentHashId("")}
              placeholder="user message"
            />
          </div>
          <Button>
            <CornerDownLeft />
          </Button>
        </div>
      </CardDescription>
    </CardContent>
  );
}
