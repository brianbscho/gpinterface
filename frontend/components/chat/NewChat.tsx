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
  ChatsGetResponse,
} from "gpinterface-shared/type/chat";
import useUserStore from "@/store/user";
import Login from "../general/dialogs/Login";

export default function NewChat({
  setChats,
}: {
  setChats: Dispatch<SetStateAction<ChatsGetResponse["chats"] | undefined>>;
}) {
  const [loading, setLoading] = useState(false);
  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const [open, setOpen] = useState(false);
  const onClick = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (isLoggedOut) {
        setOpen(true);
        return;
      }
      setLoading(true);
      const response = await callApi<ChatCreateResponse>({
        endpoint: "/chat",
        method: "POST",
        body: {},
        showError: true,
      });
      if (response) {
        setChats((prev) => (!prev ? [response] : [response, ...prev]));
      }
      setLoading(false);
    },
    [setChats, isLoggedOut]
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
