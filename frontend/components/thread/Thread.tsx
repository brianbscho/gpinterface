import { Thread as ThreadType } from "gpinterface-shared/type";
import { FileText } from "lucide-react";
import { Badge, Separator } from "../ui";

export default function Thread({ thread }: { thread: ThreadType }) {
  const username = thread.user ? thread.user.name : "unknown";
  return (
    <div className="py-1 border-b">
      <div className="flex items-center gap-3">
        {!thread.isPublic && <Badge>private</Badge>}
        <div className="text-lg">{thread.title}</div>
      </div>
      <div className="flex gap-3 justify-end items-center text-sm mt-1">
        <FileText />
        <div>{thread.posts}</div>
        <Separator orientation="vertical" />
        <div className="font-bold">{username}</div>
        <Separator orientation="vertical" />
        <div>{thread.createdAt}</div>
      </div>
    </div>
  );
}
