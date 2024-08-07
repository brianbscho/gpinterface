import { objectToInputs, stringify } from "@/utils/string";
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
import { useMemo } from "react";
import Collapsible from "../collapsible";

export default function ImageUsage({
  imageHistory,
}: {
  imageHistory: Partial<Pick<ImagePromptHistory, "createdAt">> &
    Omit<ImagePromptHistory, "createdAt">;
}) {
  const curl = useMemo(() => {
    if (!imageHistory.imagePromptHashId) return "";

    const inputs = objectToInputs(imageHistory.input);
    const input = inputs.map((i) => `"${i.name}": "${i.value}"`).join(", ");

    return `curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/image/${imageHistory.imagePromptHashId} \\
    -H "Authorization: Bearer {GPINTERFACE_API_KEY}" \\
    -H "Content-Type: application/json" \\
    -d '{${input}}'`;
  }, [imageHistory.input, imageHistory.imagePromptHashId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Detail</Button>
      </DialogTrigger>
      <DialogContent close className="w-11/12 max-w-4xl">
        <DialogHeader>
          <DialogTitle>Image Prompt Usage Detail</DialogTitle>
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
                  url: imageHistory.url,
                  price: imageHistory.price,
                }).slice(0, -2) + ","}
                <div className="flex items-start">
                  <div className="text-nowrap">{`\t"response": `}</div>
                  <div>
                    <Collapsible title="response">
                      <pre className="whitespace-pre text-wrap">
                        {stringify(imageHistory.response)}
                      </pre>
                    </Collapsible>
                  </div>
                </div>
                {`}`}
              </DialogDescription>
            </>
          )}
          <DialogTitle className="mt-7">Model</DialogTitle>
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
