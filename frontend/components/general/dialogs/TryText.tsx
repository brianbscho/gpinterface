"use client";

import {
  getHighlightedPrompt,
  inputsToObject,
  objectToInputs,
} from "@/util/string";
import { TextPrompt } from "gpinterface-shared/type";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from "@/components/ui";
import { Fragment, useCallback, useState } from "react";
import { getValidBody } from "gpinterface-shared/util";
import callApi from "@/util/callApi";
import { TextPromptExecuteResponse } from "gpinterface-shared/type/textPrompt";
import { Loader2, PlayCircle } from "lucide-react";

export default function TryText({ textPrompt }: { textPrompt: TextPrompt }) {
  const { systemMessage, messages, examples } = textPrompt;
  const [inputs, setInputs] = useState(objectToInputs(examples[0].input));
  const inputObj = inputsToObject(inputs);

  const setExampleInput = useCallback(
    (name: string) => (value: string) =>
      setInputs((prev) => {
        const newInputs = [...prev];
        const index = newInputs.findIndex((i) => i.name === name);
        if (index < 0) return newInputs;

        newInputs[index].value = value;
        return newInputs;
      }),
    []
  );

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const onClickTry = useCallback(async () => {
    try {
      if (inputs.some((i) => i.value.length === 0)) {
        throw "Please check your input";
      }

      const input = getValidBody(
        JSON.stringify([systemMessage, messages]),
        inputsToObject(inputs)
      );
      setInputErrorMessage("");

      setLoading(true);
      setContent("");
      const response = await callApi<TextPromptExecuteResponse>({
        endpoint: `/text/prompt/${textPrompt.hashId}`,
        method: "POST",
        body: input,
        showError: true,
      });
      if (response) {
        setContent(response.content);
      }
    } catch (e) {
      const msg = typeof e === "string" ? e : "Provided JSON is invalid.";
      setInputErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [inputs, systemMessage, messages, textPrompt.hashId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Try</Button>
      </DialogTrigger>
      <DialogContent close className="w-11/12 max-w-4xl">
        <div className="h-[70vh] w-full overflow-y-auto mt-7 mb-3">
          <div className="grid grid-cols-[6rem_auto_1fr] gap-3 md:gap-7 items-center text-sm">
            <DialogTitle>Messages</DialogTitle>
            {systemMessage.length > 0 && (
              <>
                <Badge
                  className="justify-center self-start"
                  variant="secondary"
                >
                  system
                </Badge>
                <div
                  className="whitespace-pre text-wrap"
                  dangerouslySetInnerHTML={{
                    __html: getHighlightedPrompt(systemMessage, inputObj),
                  }}
                />
              </>
            )}
            {messages.map((m, index) => (
              <Fragment key={`message_${index}`}>
                {(index > 0 || systemMessage.length > 0) && <div />}
                <Badge
                  className="justify-center self-start"
                  variant="secondary"
                >
                  {m.role}
                </Badge>
                <div
                  className="whitespace-pre text-wrap"
                  dangerouslySetInnerHTML={{
                    __html: getHighlightedPrompt(m.content, inputObj),
                  }}
                />
              </Fragment>
            ))}
            <div />
            {content.length > 0 || loading ? (
              <Badge className="justify-center self-start">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "assistant"
                )}
              </Badge>
            ) : (
              <div />
            )}
            <div className="whitespace-pre text-wrap">{content}</div>
            <div>
              <div className="flex items-center gap-1">
                <DialogTitle>Run</DialogTitle>
                <Button
                  onClick={onClickTry}
                  loading={loading}
                  className="rounded-full w-7 h-7 p-1"
                >
                  <PlayCircle />
                </Button>
              </div>
              <div className="text-sm text-rose-500">{inputErrorMessage}</div>
            </div>
            {inputs.map((i, index) => (
              <Fragment key={i.name}>
                {index > 0 && <div></div>}
                <div className="text-sm">{i.name}</div>
                <div className="pr-px">
                  <Textarea
                    placeholder={i.name}
                    value={i.value}
                    onChange={(e) =>
                      setExampleInput(i.name)(e.currentTarget.value)
                    }
                    disabled={loading}
                    resizing
                  />
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
