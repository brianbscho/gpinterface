"use client";

import { Button } from "../ui";
import { Dispatch, SetStateAction, useCallback } from "react";
import { PenSquare } from "lucide-react";
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
  const onClickAnswerYourself = useCallback(async () => {
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
  }, [chat.hashId, setContents]);

  return (
    <SmallHoverButton message="Answer yourself">
      <Button
        className="p-1 h-6 w-6"
        variant="default"
        onClick={onClickAnswerYourself}
      >
        <PenSquare />
      </Button>
    </SmallHoverButton>
  );
}