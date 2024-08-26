"use client";

import { useCallback, useState } from "react";
import callApi from "@/utils/callApi";
import { ChatCreateResponse } from "gpinterface-shared/type/chat";
import { PlusCircle } from "lucide-react";
import IconTextButton from "./IconTextButton";
import { useRouter } from "next/navigation";

export default function NewGpiButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onClick = useCallback(async () => {
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
  }, [router]);

  return (
    <IconTextButton
      Icon={PlusCircle}
      text="New gpi"
      loading={loading}
      onClick={onClick}
      className="w-20 md:w-28"
      responsive
    />
  );
}
