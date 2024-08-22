import { Badge } from "@/components/ui";
import { ApisGetResponse } from "gpinterface-shared/type/api";
import Link from "next/link";
import { Fragment } from "react";

export default function Api({ api }: { api: ApisGetResponse["apis"][0] }) {
  const messages = [
    {
      hashId: Math.random().toString(),
      role: "system",
      content: api.systemMessage,
    },
    ...api.messages,
  ]
    .filter((m) => m.content.length > 0)
    .slice(0, 2);
  return (
    <Link key={api.hashId} href={`/apis/${api.hashId}`}>
      <div className="w-full p-3 border-b">
        <div className="w-full flex gap-3 items-end mb-3">
          <div className="truncate">{api.description}</div>
          <div className="text-neutral-400 text-xs mb-1">{api.createdAt}</div>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-3">
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
