import { Badge } from "@/components/ui";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";
import Link from "next/link";
import { Fragment } from "react";

export default function Chat({ chat }: { chat: ChatsGetResponse["chats"][0] }) {
  const messages = [
    {
      hashId: Math.random().toString(),
      role: "system",
      content: chat.systemMessage,
    },
    ...chat.contents,
  ]
    .filter((m) => m.content.length > 0)
    .slice(0, 2);
  return (
    <Link key={chat.hashId} href={`/chats/${chat.hashId}`}>
      <div className="w-full p-3 border-b">
        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <div className="font-bold mb-1 col-span-2">{chat.createdAt}</div>
          {messages.map((message) => (
            <Fragment key={message.hashId}>
              <div className="text-right">
                <Badge variant="tag">{message.role}</Badge>
              </div>
              <div className="truncate text-sm">{message.content}</div>
            </Fragment>
          ))}
        </div>
      </div>
    </Link>
  );
}
