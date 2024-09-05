import IconTextButton from "../buttons/IconTextButton";
import { CircleX, FileCog } from "lucide-react";
import Link from "next/link";
import ContentStatic from "@/components/content/ContentStatic";
import { ChatGetResponse } from "gpinterface-shared/type/chat";

type Props = { chat: ChatGetResponse };
export default function GpiDraft({ chat }: Props) {
  return (
    <div className="w-full border border-theme rounded-md px-3 pt-3">
      <div className="sticky top-0 rounded-md w-full py-3 grid grid-cols-3 md:flex gap-3 bg-background z-30">
        <div className="flex-1 md:flex-initial md:w-32">
          <Link href={`/chats/${chat.hashId}`}>
            <IconTextButton
              className="w-full md:w-32"
              Icon={FileCog}
              text="Edit"
              responsive
            />
          </Link>
        </div>
        <div className="flex-1 md:flex-initial md:w-32">
          <IconTextButton
            className="w-full md:w-32"
            Icon={CircleX}
            variant="icon_destructive"
            text="Delete"
            responsive
          />
        </div>
      </div>
      <div className="w-full">
        <div className="flex flex-col gap-3 mb-3">
          {chat.systemMessage.length > 0 && (
            <ContentStatic role="system" content={chat.systemMessage} />
          )}
          {chat.contents.map((content) => (
            <ContentStatic key={content.hashId} {...content} />
          ))}
        </div>
      </div>
    </div>
  );
}
