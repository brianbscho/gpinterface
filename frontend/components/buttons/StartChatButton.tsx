"use client";

import {
  Badge,
  CardContent,
  CardDescription,
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../ui";
import { ContentsCreateResponse } from "gpinterface-shared/type/content";
import IconTextButton from "./IconTextButton";
import { BotMessageSquare } from "lucide-react";

type ContentType = ContentsCreateResponse["contents"][0];
type Props = {
  useContents: [ContentType[], (contents: ContentType[]) => void];
};
export default function StartChatButton({ useContents }: Props) {
  const [contents, setContents] = useContents;
  return (
    <Dialog
      open={contents.length > 0}
      onOpenChange={(open) => {
        if (!open) {
          setContents([]);
        }
      }}
    >
      <DialogTrigger asChild>
        <IconTextButton
          Icon={BotMessageSquare}
          text="Start chat"
          className="w-full md:w-32"
          responsive
        />
      </DialogTrigger>
      <DialogContent close className="w-11/12 max-w-4xl">
        {contents.map((content) => (
          <CardContent key={content.hashId} className="p-3">
            <div className="flex items-center mb-3">
              {content.role !== "assistant" && (
                <Badge className="h-6" variant="tag">
                  {content.role}
                </Badge>
              )}
              {content.role === "assistant" && (
                <Badge className="h-6" variant="tag">
                  {!content.model ? "assistant" : content.model.name}
                </Badge>
              )}
            </div>
            <CardDescription>
              <div className="relative">
                <div className="whitespace-pre-wrap px-3 py-2 text-base border rounded-md">
                  {content.content}
                </div>
              </div>
            </CardDescription>
          </CardContent>
        ))}
      </DialogContent>
    </Dialog>
  );
}
