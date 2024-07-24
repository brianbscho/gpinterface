import { stringify } from "@/util/string";
import { ImagePromptHistory } from "gpinterface-shared/type";
import EstimatedPrice from "../hover/EstimatedPrice";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

export default function ImageUsage({
  imageHistory,
}: {
  imageHistory: ImagePromptHistory;
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Detail</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="px-3">Usage Detail</DialogTitle>
        <div className="h-[70vh] overflow-y-auto py-12 px-3">
          <div className="font-bold">Model</div>
          <div className="mt-3">{`${imageHistory.provider} - ${imageHistory.model}`}</div>
          <div className="font-bold mt-12">Prompt</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {imageHistory.prompt}
          </div>
          <div className="font-bold mt-12">Generated Image</div>
          <picture>
            <img
              className="mt-3 w-full"
              src={imageHistory.url}
              alt="ai_generated_image"
            />
          </picture>
          <div className="font-bold mt-12">Response</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {stringify(imageHistory.response)}
          </div>
          <div className="font-bold mt-12">Input</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {stringify(imageHistory.input)}
          </div>
          <div className="font-bold mt-12">
            <EstimatedPrice />
          </div>
          <div className="mt-3 whitespace-pre">${imageHistory.price}</div>
          <div className="font-bold mt-12">Config</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {stringify(imageHistory.config)}
          </div>
          <div className="font-bold mt-12">Date</div>
          <div className="mt-3 whitespace-pre">{imageHistory.createdAt}</div>
        </div>
        <div className="w-full flex justify-end mt-7">
          <DialogClose>
            <Button>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
