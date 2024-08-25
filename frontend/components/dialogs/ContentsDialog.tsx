"use client";

import {
  Badge,
  CardContent,
  CardDescription,
  Dialog,
  DialogContent,
} from "../ui";
import { ContentsCreateResponse } from "gpinterface-shared/type/content";

type ContentType = ContentsCreateResponse["contents"][0];
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
