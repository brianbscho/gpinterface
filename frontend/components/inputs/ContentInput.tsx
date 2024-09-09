"use client";

import { CornerDownLeft } from "lucide-react";
import { Button, Textarea } from "../ui";
import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useState,
} from "react";

type Props = {
  onSubmit: (content: string) => Promise<void>;
  children?: ReactNode;
};

export default function ContentInput({ onSubmit: _onSubmit, children }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      await _onSubmit(content);
      setContent("");
      setLoading(false);
    },
    [_onSubmit, content]
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
  );
}
