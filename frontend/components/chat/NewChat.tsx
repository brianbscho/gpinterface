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
import SmallHoverButton from "../general/buttons/SmallHoverButton";
import { PlusCircle } from "lucide-react";

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
      <SmallHoverButton message="Create new chat">
        <Button
          className="p-1 h-6 w-6"
          variant="default"
          loading={loading}
          onClick={onClick}
        >
          <PlusCircle />
        </Button>
      </SmallHoverButton>
      <Login
        title="Please login to create new chat :)"
        useOpen={[open, setOpen]}
      />
    </>
  );
}
