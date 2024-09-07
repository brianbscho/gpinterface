"use client";

import { Button } from "../ui";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { FilePen } from "lucide-react";
import {
  ChatContent,
  ChatContentsCreateResponse,
} from "gpinterface-shared/type/chat-content";
import callApi from "@/utils/callApi";
import SmallHoverButton from "./SmallHoverButton";

type GpiType = { hashId: string; systemMessage: string };
type ContentsProps = {
  gpi: GpiType;
  setChatContents: Dispatch<SetStateAction<ChatContent[]>>;
};
export default function ContentsCreateButton({
  gpi,
  setChatContents,
}: ContentsProps) {
  const [loading, setLoading] = useState(false);
  const onClickAnswerYourself = useCallback(async () => {
    setLoading(true);
    const response = await callApi<ChatContentsCreateResponse>({
      method: "POST",
      endpoint: `users/gpis/${gpi.hashId}/chat/contents/completion`,
      showError: true,
    });
    if (response) {
      setChatContents((prev) => prev.concat(response));
    }
    setLoading(false);
  }, [gpi.hashId, setChatContents]);

  return (
    <SmallHoverButton message="Answer yourself">
      <Button
        className="p-1 h-6 w-6"
        variant="default"
        onClick={onClickAnswerYourself}
        loading={loading}
      >
        <FilePen />
      </Button>
    </SmallHoverButton>
  );
}
