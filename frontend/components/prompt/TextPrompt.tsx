"use client";

import { TextPrompt as TextPromptType } from "gpinterface-shared/type";
import { getHighlightedPrompt } from "@/util/string";
import { Fragment } from "react";
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

  return (
    <Card>
      <CardContent className="p-3 overflow-x-auto">
        <div className="grid grid-cols-[8rem_auto_1fr] gap-3 md:gap-7 items-center text-sm">
          <Title>Messages</Title>
          {systemMessage.length > 0 && (
            <>
              <Badge className="justify-center self-start" variant="secondary">
                system
              </Badge>
              <div
                className="whitespace-pre text-wrap"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedPrompt(systemMessage, example.input),
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
                  __html: getHighlightedPrompt(m.content, example.input),
                }}
              />
            </Fragment>
          ))}
          <div />
          <Badge className="justify-center self-start">assistant</Badge>
          <div className="whitespace-pre text-wrap">{example.content}</div>
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
        </div>
      </CardContent>
    </Card>
  );
}
