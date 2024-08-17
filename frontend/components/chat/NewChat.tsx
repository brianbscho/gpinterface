"use client";

import { Button } from "../ui";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import callApi from "@/utils/callApi";
import {
  ChatCreateResponse,
  ChatCreateSchema,
  ChatsGetResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import useContentStore from "@/store/content";
import { getApiConfig } from "@/utils/model";
import useUserStore from "@/store/user";
import Login from "../general/dialogs/Login";

export default function NewChat({
  setChats,
}: {
  setChats: Dispatch<SetStateAction<ChatsGetResponse["chats"] | undefined>>;
}) {
  const [model, config] = useContentStore((state) => [
    state.model,
    state.config,
  ]);
  const [loading, setLoading] = useState(false);
  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const [open, setOpen] = useState(false);
  const onClick = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!model) return;
      if (isLoggedOut) {
        setOpen(true);
        return;
      }
      setLoading(true);
      const response = await callApi<
        ChatCreateResponse,
        Static<typeof ChatCreateSchema>
      >({
        endpoint: "/chat",
        method: "POST",
        body: {
          modelHashId: model.hashId,
          config: getApiConfig(model, config),
        },
        showError: true,
      });
      if (response) {
        setChats((prev) => (!prev ? [response] : [response, ...prev]));
      }
      setLoading(false);
    },
    [config, model, setChats, isLoggedOut]
  );

  return (
    <>
      <Button
        variant="default"
        className="w-full"
        loading={loading}
        onClick={onClick}
      >
        New Chat
      </Button>
      <Login
        title="Please login to create new chat :)"
        useOpen={[open, setOpen]}
      />
    </>
  );
}
