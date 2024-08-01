"use client";

import { ImagePrompt as ImagePromptType } from "gpinterface-shared/type";
import { getHighlightedPrompt, objectToInputs } from "@/util/string";
import { useMemo } from "react";
import { Card, CardContent } from "../ui";
import Title from "../thread/Title";
import ImageUsage from "../general/dialogs/ImageUsage";

export default function ImagePrompt({
  imagePrompt,
}: {
  imagePrompt: ImagePromptType;
}) {
  const { examples, ...prompt } = imagePrompt;
  const example = examples[0];

  const curl = useMemo(() => {
    const inputs = objectToInputs(example.input);
    const input = inputs.map((i) => `"${i.name}": "${i.value}"`).join(", ");

    return `curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/image/${prompt.hashId} \\
    -H "Authorization: Bearer {YOUR_API_KEY}" \\
    -H "Content-Type: application/json" \\
    -d '{${input}}'`;
  }, [example, prompt.hashId]);

  return (
    <Card>
      <CardContent className="p-3 overflow-x-auto">
        <div className="grid grid-cols-[8rem_1fr] gap-3 md:gap-7 items-center text-sm">
          <Title>Prompt</Title>
          <div
            dangerouslySetInnerHTML={{
              __html: getHighlightedPrompt(prompt.prompt, example.input),
            }}
          />
          <Title>Generated image</Title>
          <div className="w-full h-80">
            <picture>
              <img
                className="h-full"
                src={example.url}
                alt="ai_generated_image"
              />
            </picture>
          </div>
          <Title>Detail</Title>
          <div>
            <ImageUsage
              imageHistory={{
                imagePromptHashId: imagePrompt.hashId,
                ...prompt,
                ...example,
              }}
            />
          </div>
          <Title>Request example</Title>
          <div className="whitespace-pre">{curl}</div>
        </div>
      </CardContent>
    </Card>
  );
}
