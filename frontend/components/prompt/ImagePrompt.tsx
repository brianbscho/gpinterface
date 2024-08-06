"use client";

import { ImagePrompt as ImagePromptType } from "gpinterface-shared/type";
import { getHighlightedPrompt } from "@/utils/string";
import { Card, CardContent } from "../ui";
import Title from "../thread/Title";
import ImageUsage from "../general/dialogs/ImageUsage";
import TryImage from "../general/dialogs/TryImage";

export default function ImagePrompt({
  imagePrompt,
}: {
  imagePrompt: ImagePromptType;
}) {
  const { examples, ...prompt } = imagePrompt;
  const example = examples[0];

  return (
    <Card>
      <CardContent className="p-3 overflow-x-auto">
        <div className="grid grid-cols-[8rem_1fr] gap-3 md:gap-7 items-center text-sm">
          <Title>Prompt</Title>
          <div
            className="whitespace-pre text-wrap"
            dangerouslySetInnerHTML={{
              __html: getHighlightedPrompt(prompt.prompt, example.input),
            }}
          />
          <Title>Generated image</Title>
          <div className="w-full">
            <picture>
              <img
                className="w-full"
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
          <Title>Try</Title>
          <div>
            <TryImage imagePrompt={imagePrompt} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
