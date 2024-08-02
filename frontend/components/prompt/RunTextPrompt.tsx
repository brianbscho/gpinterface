"use client";

import {
  getHighlightedPrompt,
  inputsToObject,
  objectToInputs,
} from "@/util/string";
import { TextPrompt } from "gpinterface-shared/type";
import { Badge, Button, Textarea } from "@/components/ui";
import { Fragment, useCallback, useState } from "react";
import { getValidBody } from "gpinterface-shared/util";
import callApi from "@/util/callApi";
import { TextPromptExecuteResponse } from "gpinterface-shared/type/textPrompt";
import { Loader2, PlayCircle } from "lucide-react";
import UserRequiredButton from "../general/buttons/UserRequiredButton";
import TextUsage from "../general/dialogs/TextUsage";

export default function RunTextPrompt({
  textPrompt,
  showDetail = false,
  titleClassName = "text-lg font-semibold leading-none tracking-tight",
}: {
  textPrompt: TextPrompt;
  showDetail?: boolean;
  titleClassName?: string;
}) {
  const { systemMessage, messages, examples } = textPrompt;
  const example = examples[0];
  const [inputs, setInputs] = useState(objectToInputs(example.input));
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
    <div className="grid grid-cols-[6rem_auto_1fr] gap-3 md:gap-7 items-center text-sm">
      <div className={titleClassName}>Messages</div>
      {systemMessage.length > 0 && (
        <>
          <Badge className="justify-center self-start" variant="secondary">
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
          <Badge className="justify-center self-start" variant="secondary">
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "assistant"}
        </Badge>
      ) : (
        <div />
      )}
      <div className="whitespace-pre text-wrap">{content}</div>
      <div>
        <div className="flex items-center gap-1">
          <div className={titleClassName}>Run</div>
          <UserRequiredButton onClick={onClickTry}>
            <Button loading={loading} className="rounded-full w-7 h-7 p-1">
              <PlayCircle />
            </Button>
          </UserRequiredButton>
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
              onChange={(e) => setExampleInput(i.name)(e.currentTarget.value)}
              disabled={loading}
              resizing
            />
          </div>
        </Fragment>
      ))}
      {showDetail && (
        <>
          <div className={titleClassName}>Detail</div>
          <div className="col-span-2">
            <TextUsage
              textHistory={{
                ...textPrompt,
                ...example,
                textPromptHashId: textPrompt.hashId,
                systemMessage,
                messages: messages.map((m) => ({
                  content: m.content,
                  role: m.role,
                })),
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
