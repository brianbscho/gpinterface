import { Badge } from "@/components/ui";
import { ApisGetResponse } from "gpinterface-shared/type/api";
import Link from "next/link";
import { Fragment } from "react";

export default function Api({ api }: { api: ApisGetResponse["apis"][0] }) {
  return (
    <Link key={api.hashId} href={`/apis/${api.hashId}`}>
      <div className="w-full p-3 border-b">
        <div className="w-full flex gap-3 items-center mb-3">
          <div className="flex-1 truncate">{api.description}</div>
          <div className="text-xs">{api.createdAt}</div>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-3">
          {api.systemMessage.length > 0 && (
            <>
              <Badge>system</Badge>
              <div className="truncate text-sm">{api.systemMessage}</div>
            </>
          )}
          {api.messages.map((message) => (
            <Fragment key={message.hashId}>
              <Badge>{message.role}</Badge>
              <div className="truncate text-sm">{message.content}</div>
            </Fragment>
          ))}
        </div>
      </div>
    </Link>
  );
}
