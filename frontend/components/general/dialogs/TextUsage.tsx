import { stringify } from "@/util/string";
import { TextPromptHistory } from "gpinterface-shared/type";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { getBasePrice } from "gpinterface-shared/models/text/model";

export default function TextUsage({
  textHistory,
}: {
  textHistory: TextPromptHistory;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Detail</Button>
      </DialogTrigger>
      <DialogContent close>
        <DialogHeader>
          <DialogTitle>Text Prompt Usage Usage Detail</DialogTitle>
        </DialogHeader>
        <div className="h-[70vh] overflow-y-auto mt-7 mb-3">
          <DialogTitle>Model</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">{`${textHistory.provider} - ${textHistory.model}`}</DialogDescription>
          <DialogTitle className="mt-7">System Messages</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {textHistory.systemMessage}
          </DialogDescription>
          <DialogTitle className="mt-7">Messages</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.messages)}
          </DialogDescription>
          <DialogTitle className="mt-7">Config</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.config)}
          </DialogDescription>
          <DialogTitle className="mt-7">Input</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.input)}
          </DialogDescription>
          <DialogTitle className="mt-7">Answer</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {textHistory.content}
          </DialogDescription>
          <DialogTitle className="mt-7">Base price</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {getBasePrice(textHistory.model)}
          </DialogDescription>
          <DialogTitle className="mt-7">Price</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            ${textHistory.price}
          </DialogDescription>
          <DialogTitle className="mt-7">Response</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.response)}
          </DialogDescription>
          <DialogTitle className="mt-7">Date</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {textHistory.createdAt}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}
