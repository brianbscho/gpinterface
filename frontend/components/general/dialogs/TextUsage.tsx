import { stringify } from "@/util/string";
import { TextPromptHistory } from "gpinterface-shared/type";
import EstimatedPrice from "../hover/EstimatedPrice";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

export default function TextUsage({
  textHistory,
}: {
  textHistory: TextPromptHistory;
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
          <div className="mt-3">{`${textHistory.provider} - ${textHistory.model}`}</div>
          <div className="font-bold mt-12">Input</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.input)}
          </div>
          <div className="font-bold mt-12">Answer</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {textHistory.content}
          </div>
          <div className="font-bold mt-12">
            <EstimatedPrice />
          </div>
          <div className="mt-3 whitespace-pre">${textHistory.price}</div>
          <div className="font-bold mt-12">Response</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.response)}
          </div>
          <div className="font-bold mt-12">System Messages</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {textHistory.systemMessage}
          </div>
          <div className="font-bold mt-12">Messages</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.messages)}
          </div>
          <div className="font-bold mt-12">Config</div>
          <div className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.config)}
          </div>
          <div className="font-bold mt-12">Date</div>
          <div className="mt-3 whitespace-pre">{textHistory.createdAt}</div>
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
