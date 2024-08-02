"use client";

import {
  getHighlightedPrompt,
  inputsToObject,
  objectToInputs,
} from "@/util/string";
import { ImagePrompt } from "gpinterface-shared/type";
import { Button, Textarea } from "@/components/ui";
import { Fragment, useCallback, useState } from "react";
import { getValidBody } from "gpinterface-shared/util";
import callApi from "@/util/callApi";
import { ImagePromptExecuteResponse } from "gpinterface-shared/type/imagePrompt";
import { Loader2, PlayCircle } from "lucide-react";
import UserRequiredButton from "../general/buttons/UserRequiredButton";
import ImageUsage from "../general/dialogs/ImageUsage";

export default function RunImagePrompt({
  imagePrompt,
  showDetail = false,
  titleClassName = "text-lg font-semibold leading-none tracking-tight",
}: {
  imagePrompt: ImagePrompt;
  showDetail?: boolean;
  titleClassName?: string;
}) {
  const { prompt, examples } = imagePrompt;
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
  const [imgUrl, setImgUrl] = useState("");
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const onClickTry = useCallback(async () => {
    try {
      if (inputs.some((i) => i.value.length === 0)) {
        throw "Please check your input";
      }

      const input = getValidBody(prompt, inputsToObject(inputs));
      setInputErrorMessage("");

      setLoading(true);
      setImgUrl("");
      const response = await callApi<ImagePromptExecuteResponse>({
        endpoint: `/image/prompt/${imagePrompt.hashId}`,
        method: "POST",
        body: input,
        showError: true,
      });
      if (response) {
        setImgUrl(response.url);
      }
    } catch (e) {
      const msg = typeof e === "string" ? e : "Provided JSON is invalid.";
      setInputErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [inputs, prompt, imagePrompt.hashId]);

  return (
    <div className="grid grid-cols-[10rem_auto_1fr] gap-3 md:gap-7 items-center text-sm">
      <div className={titleClassName}>Prompt</div>
      <div className="col-span-2">
        <div
          className="whitespace-pre text-wrap"
          dangerouslySetInnerHTML={{
            __html: getHighlightedPrompt(prompt, inputObj),
          }}
        />
      </div>
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
      {loading && (
        <div className="col-span-3">
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        </div>
      )}
      {imgUrl.length > 0 && (
        <>
          <div className={titleClassName}>Generated image</div>
          <div className="col-span-2">
            <div className="w-full h-80">
              <picture>
                <img
                  className="h-full  mx-auto"
                  src={imgUrl}
                  alt="ai_generated_image"
                />
              </picture>
            </div>
          </div>
          <div className={titleClassName}>URL</div>
          <div className="col-span-2 text-wrap">{imgUrl}</div>
        </>
      )}
      {showDetail && (
        <>
          <div className={titleClassName}>Detail</div>
          <div className="col-span-2">
            <ImageUsage
              imageHistory={{
                imagePromptHashId: imagePrompt.hashId,
                ...imagePrompt,
                ...example,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
