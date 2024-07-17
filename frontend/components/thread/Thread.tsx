import { FileTextIcon } from "@radix-ui/react-icons";
import { Badge, Separator } from "@radix-ui/themes";
import { Thread as ThreadType } from "gpinterface-shared/type";

export default function Thread({ thread }: { thread: ThreadType }) {
  const username = thread.user ? thread.user.name : "unknown";
  return (
    <div className="py-1 border-b">
      <div className="flex items-center gap-3">
        {!thread.isPublic && <Badge>private</Badge>}
        <div className="text-lg">{thread.title}</div>
      </div>
      <div className="flex gap-3 justify-end items-center text-sm mt-1">
        <FileTextIcon />
        <div>{thread.posts}</div>
        <Separator orientation="vertical" />
        <div className="font-bold">{username}</div>
        <Separator orientation="vertical" />
        <div>{thread.createdAt}</div>
      </div>
    </div>
  );
}
