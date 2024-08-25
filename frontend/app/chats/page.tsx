"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState, Fragment } from "react";
import List from "@/components/List";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";
import { Badge } from "@/components/ui";
import Link from "next/link";

function Chat({ chat }: { chat: ChatsGetResponse["chats"][0] }) {
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

export default function Page() {
  const [chats, setChats] = useState<ChatsGetResponse["chats"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callChatsChat = useCallback(async () => {
    const response = await callApi<ChatsGetResponse>({
      endpoint: `/chats?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      setChats((prev) => [...(prev ?? []), ...response.chats]);
      if (response.chats.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  return (
    <div className="w-full">
      <List
        callApi={callChatsChat}
        emptyMessage="No Chats yet"
        elements={chats}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {chats?.map((chat) => (
          <Chat key={chat.hashId} chat={chat} />
        ))}
      </List>
    </div>
  );
}
