"use client";

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
import LoginDialog from "../dialogs/LoginDialog";
import { PlusCircle } from "lucide-react";
import IconTextButton from "./IconTextButton";

export default function NewChatButton({
  className,
  setChats,
}: {
  className: string;
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
    <div className={className}>
      <IconTextButton
        Icon={PlusCircle}
        text="New chat"
        loading={loading}
        onClick={onClick}
        className="w-24 md:w-32"
        responsive
      />
      <LoginDialog
        title="Please login to create new chat :)"
        useOpen={[open, setOpen]}
      />
    </div>
  );
}
