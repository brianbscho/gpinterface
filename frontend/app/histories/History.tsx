import { stringify } from "@/utils/string";
import { History as HistoryType } from "gpinterface-shared/type";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

export default function History({ history }: { history: HistoryType }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Detail</Button>
      </DialogTrigger>
      <DialogContent close className="w-11/12 max-w-4xl">
        <DialogHeader>
          <DialogTitle>Text Prompt Usage Detail</DialogTitle>
        </DialogHeader>
        <div className="h-[70vh] w-full overflow-y-auto mt-7 mb-3">
          <DialogTitle className="mt-7">Model</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">{`${history.provider} - ${history.model}`}</DialogDescription>
          <DialogTitle className="mt-7">Config</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(history.config)}
          </DialogDescription>
          <DialogTitle className="mt-7">Messages</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(history.messages)}
          </DialogDescription>
          <DialogTitle className="mt-7">Answer</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {history.content}
          </DialogDescription>
          <DialogTitle className="mt-7">Price</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            ${history.price}
          </DialogDescription>
          <DialogTitle className="mt-7">Response</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(history.response)}
          </DialogDescription>
          <DialogTitle className="mt-7">Date</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {history.createdAt}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}
