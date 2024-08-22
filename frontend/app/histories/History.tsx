import { stringify } from "@/utils/string";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { HistoriesGetResponse } from "gpinterface-shared/type/history";
import MenuButton from "@/components/general/buttons/MenuButton";
import { ReceiptText } from "lucide-react";

type Props = { history: HistoriesGetResponse["histories"][0] };
export default function History({ history }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <MenuButton
          className="w-28 h-6"
          Icon={ReceiptText}
          text="Show detail"
        />
      </DialogTrigger>
      <DialogContent close className="w-11/12 max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detail</DialogTitle>
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
