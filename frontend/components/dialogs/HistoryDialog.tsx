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
import { Content } from "gpinterface-shared/type/content";
import { ReactNode } from "react";

type Props = {
  history:
    | HistoriesGetResponse[0]
    | Exclude<Content["history"], undefined | null>;
  children: ReactNode;
};
export default function History({ history, children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent close className="max-w-3xl w-11/12">
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
