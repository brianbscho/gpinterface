import { Thread as ThreadType } from "gpinterface-shared/type";
import { FileText } from "lucide-react";
import { Badge } from "../ui";

export default function Thread({ thread }: { thread: ThreadType }) {
  const username = thread.user ? thread.user.name : "unknown";
  return (
    <div className="py-3 border-b">
      <div className="flex items-center">
        {!thread.isPublic && <Badge className="mr-3">private</Badge>}
        <div className="mr-3 text-sm md:text-base truncate">{thread.title}</div>
        <FileText className="mr-1 shrink-0" />
        <div className="text-xs md:text-sm">{thread.posts}</div>
      </div>
      <div className="flex gap-3 items-center text-xs md:text-sm mt-1">
        <div>{username}</div>
        <div className="text-muted-foreground">{thread.createdAt}</div>
      </div>
    </div>
  );
}
