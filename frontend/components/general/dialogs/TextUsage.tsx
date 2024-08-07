import { objectToInputs, stringify } from "@/utils/string";
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
import { useMemo } from "react";
import Collapsible from "../collapsible";

type TokensRemovedHistory = Omit<
  TextPromptHistory,
  "inputTokens" | "outputTokens"
>;
export default function TextUsage({
  textHistory,
}: {
  textHistory: Partial<Pick<TokensRemovedHistory, "createdAt">> &
    Omit<TokensRemovedHistory, "createdAt">;
}) {
  const curl = useMemo(() => {
    if (!textHistory.textPromptHashId) return "";

    const inputs = objectToInputs(textHistory.input);
    const input = inputs.map((i) => `"${i.name}": "${i.value}"`).join(", ");

    return `curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/text/${textHistory.textPromptHashId} \\
    -H "Authorization: Bearer {GPINTERFACE_API_KEY}" \\
    -H "Content-Type: application/json" \\
    -d '{${input}}'`;
  }, [textHistory.input, textHistory.textPromptHashId]);

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
          {!!curl && (
            <>
              <DialogTitle>Request example</DialogTitle>
              <DialogDescription className="mt-3 whitespace-pre text-wrap">
                {curl}
              </DialogDescription>
              <DialogTitle className="mt-7">Response example</DialogTitle>
              <DialogDescription className="mt-3 whitespace-pre text-wrap">
                {stringify({
                  content: textHistory.content,
                  price: textHistory.price,
                }).slice(0, -2) + ","}
                <div className="flex items-start">
                  <div className="text-nowrap">{`\t"response": `}</div>
                  <div>
                    <Collapsible title="response">
                      <div className="whitespace-pre text-wrap">
                        {stringify(textHistory.response)}
                      </div>
                    </Collapsible>
                  </div>
                </div>
                {`}`}
              </DialogDescription>
            </>
          )}
          <DialogTitle className="mt-7">Model</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">{`${textHistory.provider} - ${textHistory.model}`}</DialogDescription>
          <DialogTitle className="mt-7">Config</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.config)}
          </DialogDescription>
          <DialogTitle className="mt-7">System Messages</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {textHistory.systemMessage}
          </DialogDescription>
          <DialogTitle className="mt-7">Messages</DialogTitle>
          <DialogDescription className="mt-3 whitespace-pre text-wrap">
            {stringify(textHistory.messages)}
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
          {!!textHistory.createdAt && (
            <>
              <DialogTitle className="mt-7">Date</DialogTitle>
              <DialogDescription className="mt-3 whitespace-pre text-wrap">
                {textHistory.createdAt}
              </DialogDescription>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
