import { stringify } from "@/util/string";
import { ImagePromptHistory } from "gpinterface-shared/type";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

export default function ImageUsage({
  imageHistory,
}: {
  imageHistory: Partial<Pick<ImagePromptHistory, "createdAt">> &
    Omit<ImagePromptHistory, "createdAt">;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Detail</Button>
      </DialogTrigger>
      <DialogContent close>
        <DialogHeader>
          <DialogTitle>Image Prompt Usage Usage Detail</DialogTitle>
        </DialogHeader>
        <div className="h-[70vh] overflow-y-auto mt-7 mb-3">
          <DialogTitle>Model</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">{`${imageHistory.provider} - ${imageHistory.model}`}</DialogDescription>
          <DialogTitle className="mt-7">Config</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(imageHistory.config)}
          </DialogDescription>
          <DialogTitle className="mt-7">Prompt</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {imageHistory.prompt}
          </DialogDescription>
          <DialogTitle className="mt-7">Input</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(imageHistory.input)}
          </DialogDescription>
          <DialogTitle className="mt-7">Generated Image</DialogTitle>
          <picture>
            <img
              className="mt-3 w-full"
              src={imageHistory.url}
              alt="ai_generated_image"
            />
          </picture>
          <DialogTitle className="mt-7">Price</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            ${imageHistory.price}
          </DialogDescription>
          <DialogTitle className="mt-7">Response</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(imageHistory.response)}
          </DialogDescription>
          {!!imageHistory.createdAt && (
            <>
              <DialogTitle className="mt-7">Date</DialogTitle>
              <DialogDescription className="mt-3 whitespace-pre text-wrap">
                {imageHistory.createdAt}
              </DialogDescription>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
