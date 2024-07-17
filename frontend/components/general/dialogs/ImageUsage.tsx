import { stringify } from "@/util/string";
import { Button, Dialog } from "@radix-ui/themes";
import { ImagePromptHistory } from "gpinterface-shared/type";
import EstimatedPrice from "../hover/EstimatedPrice";

export default function ImageUsage({
  imageHistory,
}: {
  imageHistory: ImagePromptHistory;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Detail</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Usage Detail</Dialog.Title>
        <div className="h-[70vh] overflow-y-auto py-12">
          <div className="font-bold">Model</div>
          <div className="mt-3">{`${imageHistory.provider} - ${imageHistory.model}`}</div>
          <div className="font-bold mt-12">Prompt</div>
          <div className="mt-3 whitespace-pre">{imageHistory.prompt}</div>
          <div className="font-bold mt-12">Generated Image</div>
          <picture>
            <img
              className="mt-3 w-full"
              src={imageHistory.url}
              alt="ai_generated_image"
            />
          </picture>
          <div className="font-bold mt-12">Response</div>
          <div className="mt-3 whitespace-pre">
            {stringify(imageHistory.response)}
          </div>
          <div className="font-bold mt-12">Input</div>
          <div className="mt-3 whitespace-pre">
            {stringify(imageHistory.input)}
          </div>
          <div className="font-bold mt-12">
            <EstimatedPrice />
          </div>
          <div className="mt-3 whitespace-pre">${imageHistory.price}</div>
          <div className="font-bold mt-12">Config</div>
          <div className="mt-3 whitespace-pre">
            {stringify(imageHistory.config)}
          </div>
        </div>
        <div className="w-full flex justify-end mt-7">
          <Dialog.Close>
            <Button>Close</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
