"use client";

import { Chat as ChatType } from "gpinterface-shared/type";
import { useMemo } from "react";
import { Card } from "../ui";
import Content from "./Content";

export default function Chat({ chat }: { chat: ChatType }) {
  const contents = useMemo(() => chat.contents, [chat.contents]);

  const systemContent = useMemo(
    () => ({ role: "system", content: chat.systemMessage }),
    [chat.systemMessage]
  );
  return (
    <Card className="w-full mb-3 flex flex-col gap-3">
      <Content content={systemContent} />
      {contents.map((c) => (
        <Content key={c.hashId} content={c} />
      ))}
    </Card>
  );
}
