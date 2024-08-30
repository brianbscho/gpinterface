"use client";

import { Button } from "../ui";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { FilePen } from "lucide-react";
import {
  Content as ContentType,
  ContentsCreateResponse,
  ContentsCreateSchema,
} from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import callApi from "@/utils/callApi";
import SmallHoverButton from "./SmallHoverButton";

type ChatType = { hashId: string; systemMessage: string };
type ContentsProps = {
  chat: ChatType;
  setContents: Dispatch<SetStateAction<ContentType[]>>;
};
export default function AnswerYourselfButton({
  chat,
  setContents,
}: ContentsProps) {
  const [loading, setLoading] = useState(false);
  const onClickAnswerYourself = useCallback(async () => {
    setLoading(true);
    const response = await callApi<
      ContentsCreateResponse,
      Static<typeof ContentsCreateSchema>
    >({
      method: "POST",
      endpoint: "/contents",
      body: { chatHashId: chat.hashId },
    });
    if (response) {
      setContents((prev) => prev.concat(response.contents));
    }
    setLoading(false);
  }, [chat.hashId, setContents]);

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
