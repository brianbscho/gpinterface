"use client";

import { CornerDownLeft } from "lucide-react";
import { Button, Dialog, DialogContent, DialogHeader, Input } from "../ui";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { Chat } from "gpinterface-shared/type";
import callApi from "@/utils/callApi";
import {
  ChatCreateResponse,
  ChatCreateSchema,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import useContentStore from "@/store/content";

export default function NewChat({
  setChats,
}: {
  setChats: Dispatch<SetStateAction<Chat[] | undefined>>;
}) {
  const [open, setOpen] = useState(false);

  const [content, setContent] = useState("");
  const [modelHashId, config] = useContentStore((state) => [
    state.model?.hashId,
    state.config,
  ]);
  const [loading, setLoading] = useState(false);
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!modelHashId) return;
      setLoading(true);
      const response = await callApi<
        ChatCreateResponse,
        Static<typeof ChatCreateSchema>
      >({
        endpoint: "/chat",
        method: "POST",
        body: { modelHashId, content, config },
        showError: true,
      });
      if (response) {
        setChats((prev) => (!prev ? [response] : [response, ...prev]));
      }
      setLoading(false);
    },
    [config, content, modelHashId, setChats]
  );

  return (
    <div>
      <Input
        className="bg-secondary"
        placeholder="Your message"
        onFocus={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={loading ? undefined : setOpen}>
        <DialogContent className="max-w-full w-11/12">
          <DialogHeader>New Chat</DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="w-full my-12 flex gap-3">
              <Input
                className="flex-1 bg-secondary"
                placeholder="Your message"
                value={content}
                onChange={(e) => setContent(e.currentTarget.value)}
                disabled={loading}
              />
              <Button type="submit" disabled={content === ""} loading={loading}>
                <CornerDownLeft />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
