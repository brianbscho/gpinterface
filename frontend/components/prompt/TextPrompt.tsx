"use client";

import { TextPrompt as TextPromptType } from "gpinterface-shared/type";
import { getHighlightedPrompt, objectToInputs } from "@/util/string";
import { Fragment, useMemo } from "react";
import Title from "../thread/Title";
import TextUsage from "../general/dialogs/TextUsage";
import { Badge, Card, CardContent } from "../ui";

export default function TextPrompt({
  textPrompt,
}: {
  textPrompt: TextPromptType;
}) {
  const { systemMessage, messages, examples, ...prompt } = textPrompt;
  const example = examples[0];

  const curl = useMemo(() => {
    const inputs = objectToInputs(example.input);
    const input = inputs.map((i) => `"${i.name}": "${i.value}"`).join(", ");

    return `curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/text/${textPrompt.hashId} \\
    -H "Authorization: Bearer {your_api_key}" \\
    -H "Content-Type: application/json" \\
    -d '{${input}}'`;
  }, [example.input, textPrompt.hashId]);

  return (
    <Card>
      <CardContent className="p-3 overflow-x-auto">
        <div className="grid grid-cols-[8rem_auto_1fr] gap-3 md:gap-7 items-center text-sm">
          <Title>Messages</Title>
          {systemMessage.length > 0 && (
            <>
              <Badge className="justify-center" variant="secondary">
                system
              </Badge>
              <div
                className="whitespace-pre"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedPrompt(systemMessage, example.input),
                }}
              />
            </>
          )}
          {messages.map((m, index) => (
            <Fragment key={`message_${index}`}>
              {(index > 0 || systemMessage.length > 0) && <div />}
              <Badge className="justify-center" variant="secondary">
                {m.role}
              </Badge>
              <div
                className="whitespace-pre"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedPrompt(m.content, example.input),
                }}
              />
            </Fragment>
          ))}
          <div />
          <Badge className="justify-center" variant="secondary">
            assistant
          </Badge>
          <div>{example.content}</div>
          <Title>Detail</Title>
          <div>
            <TextUsage
              textHistory={{
                textPromptHashId: textPrompt.hashId,
                systemMessage,
                messages: messages.map((m) => ({
                  content: m.content,
                  role: m.role,
                })),
                ...prompt,
                ...example,
              }}
            />
          </div>
          <div />
          <Title>Request example</Title>
          <div className="whitespace-pre col-span-2">{curl}</div>
        </div>
      </CardContent>
    </Card>
  );
}
