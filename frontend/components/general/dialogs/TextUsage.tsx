import { stringify } from "@/util/string";
import { Button, Dialog } from "@radix-ui/themes";
import { TextPromptHistory } from "gpinterface-shared/type";
import EstimatedPrice from "../hover/EstimatedPrice";

export default function TextUsage({
  textHistory,
}: {
  textHistory: TextPromptHistory;
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
          <div className="mt-3">{`${textHistory.provider} - ${textHistory.model}`}</div>
          <div className="font-bold mt-12">Input</div>
          <div className="mt-3 whitespace-pre">
            {stringify(textHistory.input)}
          </div>
          <div className="font-bold mt-12">Answer</div>
          <div className="mt-3 whitespace-pre">{textHistory.content}</div>
          <div className="font-bold mt-12">Price</div>
          <div className="mt-3 whitespace-pre">${textHistory.price}</div>
          <div className="font-bold mt-12">
            <EstimatedPrice />
          </div>
          <div className="mt-3 whitespace-pre">${textHistory.price}</div>
          <div className="font-bold mt-12">Response</div>
          <div className="mt-3 whitespace-pre">
            {stringify(textHistory.response)}
          </div>
          <div className="font-bold mt-12">System Messages</div>
          <div className="mt-3 whitespace-pre">{textHistory.systemMessage}</div>
          <div className="font-bold mt-12">Messages</div>
          <div className="mt-3 whitespace-pre">
            {stringify(textHistory.messages)}
          </div>
          <div className="font-bold mt-12">Config</div>
          <div className="mt-3 whitespace-pre">
            {stringify(textHistory.config)}
          </div>
          <div className="font-bold mt-12">Date</div>
          <div className="mt-3 whitespace-pre">{textHistory.createdAt}</div>
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
