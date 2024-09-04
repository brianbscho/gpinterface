"use client";

import { FormEvent, useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import { ChatCreateResponse } from "gpinterface-shared/type/chat";
import useUserStore from "@/store/user";
import LoginDialog from "../dialogs/LoginDialog";
import { CirclePlus } from "lucide-react";
import IconTextButton from "./IconTextButton";
import { useRouter } from "next/navigation";

export default function ChatCreateButton({
  className,
}: {
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const onClick = useCallback(async () => {
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
      router.push(`/chats/${response.hashId}`);
    }
    setLoading(false);
  }, [isLoggedOut, router]);

  return (
    <div className={className}>
      <IconTextButton
        Icon={CirclePlus}
        text="Create"
        loading={loading}
        onClick={onClick}
        className="w-20 md:w-28"
        responsive
      />
      <LoginDialog useOpen={[open, setOpen]} />
    </div>
  );
}
