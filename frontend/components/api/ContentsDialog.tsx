"use client";

import {
  Badge,
  CardContent,
  CardDescription,
  Dialog,
  DialogContent,
} from "../ui";
import { ContentsGetResponse } from "gpinterface-shared/type/content";

type ContentType = ContentsGetResponse["contents"][0];
type Props = {
  useContents: [ContentType[], (contents: ContentType[]) => void];
};
export default function ContentsDialog({ useContents }: Props) {
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
      <DialogContent close className="w-11/12 max-w-4xl">
        {contents.map((content) => (
          <CardContent key={content.hashId} className="p-3">
            <div className="flex items-center mb-3">
              <Badge>{content.role}</Badge>
              {!!content.model && content.role === "assistant" && (
                <div className="ml-1 text-xs">{content.model.name}</div>
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
