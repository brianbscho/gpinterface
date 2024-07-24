"use client";

import { ImagePrompt as ImagePromptType } from "gpinterface-shared/type";
import Collapsible from "@/components/general/collapsible";
import { inputsToObject, objectToInputs, stringify } from "@/util/string";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Button } from "@radix-ui/themes";
import callApi from "@/util/callApi";
import { ImagePromptExecuteResponse } from "gpinterface-shared/type/imagePrompt";
import EstimatedPrice from "@/components/general/hover/EstimatedPrice";
import Textarea from "@/components/general/inputs/Textarea";
import { getValidBody } from "gpinterface-shared/util";
import UserRequiredButton from "@/components/general/buttons/UserRequiredButton";

export default function ImagePrompt({
  imagePrompt,
}: {
  imagePrompt: ImagePromptType;
}) {
  const { prompt, examples } = imagePrompt;
  const [example, setExample] = useState(examples[0]);
  const [inputs, setInputs] = useState(objectToInputs(examples[0].input));
  const setExampleInput = useCallback(
    (index: number) => (value: string) =>
      setInputs((prev) => {
        const newInputs = [...prev];
        newInputs[index].value = value;
        return newInputs;
      }),
    []
  );

  const [loading, setLoading] = useState(false);
  const [inputErrorMessage, setInputErrorMessage] = useState("");

  const onClickTry = useCallback(async () => {
    try {
      const input = getValidBody(prompt, inputsToObject(inputs));
      setInputErrorMessage("");

      setLoading(true);
      setExample({ hashId: "", input: {}, url: "", response: {}, price: 0 });
      const response = await callApi<ImagePromptExecuteResponse>({
        endpoint: `/image/prompt/${imagePrompt.hashId}`,
        method: "POST",
        body: input,
        showError: true,
      });
      if (response) {
        setExample((prev) => ({ ...prev, ...response }));
      }
    } catch (e) {
      const msg = typeof e === "string" ? e : "Provided JSON is invalid.";
      setInputErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [inputs, prompt, imagePrompt.hashId]);

  const curl = useMemo(() => {
    const input = inputs.map((i) => `"${i.name}": "some_value"`).join(", ");

    return `curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/image/${imagePrompt.hashId} \\
    -H "Authorization: Bearer {YOUR_API_KEY}" \\
    -H "Content-Type: application/json" \\
    -d '{${input}}'`;
  }, [inputs, imagePrompt.hashId]);

  return (
    <>
      <table className="w-full">
        <tbody className="align-top">
          <tr>
            <td>
              <div className="font-bold image-nowrap">Prompt</div>
            </td>
            <td>
              <div>{imagePrompt.prompt}</div>
            </td>
          </tr>
          <tr>
            <td>
              <UserRequiredButton onClick={onClickTry}>
                <Button loading={loading}>Try</Button>
              </UserRequiredButton>
              <div className="text-sm text-rose-500 mt-3">
                {inputErrorMessage}
              </div>
            </td>
            <td>
              <div className="grid grid-cols-[auto_1fr] gap-3 w-full">
                {inputs.map((i, index) => (
                  <Fragment key={i.name}>
                    <div className="font-bold">{i.name}</div>
                    <Textarea
                      className="focus:outline-none border border-px rounded p-1 resize-none h-40"
                      placeholder={i.name}
                      useValue={[i.value, setExampleInput(index)]}
                      disabled={loading}
                    />
                  </Fragment>
                ))}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <div className="w-full h-80">
                <picture>
                  <img
                    className="h-full"
                    src={example.url}
                    alt="ai_generated_image"
                  />
                </picture>
              </div>
            </td>
          </tr>
          <tr>
            <td>URL</td>
            <td className="whitespace-pre text-wrap">
              <a target="_blank" href={example.url}>
                {example.url}
              </a>
            </td>
          </tr>
          <tr>
            <td>
              <EstimatedPrice />
            </td>
            <td>
              <div>
                <div className="whitespace-pre text-wrap">${example.price}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td>Response</td>
            <td>
              <Collapsible>
                <div className="border rounded p-1 whitespace-pre text-wrap">
                  {stringify(example.response)}
                </div>
              </Collapsible>
            </td>
          </tr>
          <tr>
            <td className="min-w-24 md:w-40">
              <div className="font-bold">{imagePrompt.provider}</div>
            </td>
            <td>
              <div>{imagePrompt.model}</div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="font-bold image-nowrap">Config</div>
            </td>
            <td>
              <div>
                <Collapsible>
                  <div className="border rounded p-1 whitespace-pre">
                    {stringify(imagePrompt.config)}
                  </div>
                </Collapsible>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="font-bold image-nowrap">How to call</div>
            </td>
            <td>
              <div className="whitespace-pre">{curl}</div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="font-bold image-nowrap">Example response</div>
            </td>
            <td>
              <div className="whitespace-pre text-wrap">
                {stringify({
                  url: example.url,
                  price: example.price,
                }).slice(0, -2) + ","}
                <div className="flex items-start">
                  <div className="text-nowrap">{`\t"response": `}</div>
                  <div>
                    <Collapsible title="response">
                      <pre className="whitespace-pre text-wrap">
                        {stringify(example.response)}
                      </pre>
                    </Collapsible>
                  </div>
                </div>
                {`}`}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
