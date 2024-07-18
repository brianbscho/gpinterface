"use client";

import { ImagePrompt as ImagePromptType } from "gpinterface-shared/type";
import Collapsible from "@/components/general/collapsible";
import { stringify } from "@/util/string";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@radix-ui/themes";
import { getRequiredKeys } from "gpinterface-shared/string";
import callApi from "@/util/callApi";
import { ImagePromptExecuteResponse } from "gpinterface-shared/type/imagePrompt";
import Login from "@/components/general/dialogs/Login";
import useUserStore from "@/store/user";
import EstimatedPrice from "@/components/general/hover/EstimatedPrice";
import Textarea from "@/components/general/inputs/Textarea";

export default function ImagePrompt({
  imagePrompt,
}: {
  imagePrompt: ImagePromptType;
}) {
  const { prompt, examples } = imagePrompt;
  const [example, setExample] = useState({
    ...examples[0],
    input: stringify(examples[0].input),
  });
  const setInput = useCallback(
    (input: string) => setExample((prev) => ({ ...prev, input })),
    []
  );

  const [loading, setLoading] = useState(false);
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const requiredKeys = useMemo(() => getRequiredKeys(prompt), [prompt]);

  const [loginOpen, setLoginOpen] = useState(false);
  const { user } = useUserStore();
  const onClickTry = useCallback(async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }

    try {
      const input = JSON.parse(example.input);
      for (const key of requiredKeys) {
        if (!(key in input)) {
          setInputErrorMessage(`${key} is missing`);
          return;
        }
      }
      setInputErrorMessage("");

      setLoading(true);
      const response = await callApi<ImagePromptExecuteResponse>({
        endpoint: `/image/prompt/${imagePrompt.hashId}`,
        method: "POST",
        body: input,
        showError: true,
      });
      if (response) {
        setExample((prev) => ({ ...prev, ...response }));
      }
    } catch {
      setInputErrorMessage("Provided JSON is invalid.");
    } finally {
      setLoading(false);
    }
  }, [user, example.input, requiredKeys, imagePrompt.hashId]);

  const curl = useMemo(() => {
    const body = requiredKeys.reduce((obj, key) => {
      obj[key] = "value";
      return obj;
    }, {} as any);

    return `curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/image/${
      imagePrompt.hashId
    } \\
    -H "Authorization: Bearer {your_api_key}" \\
    -H "Content-Type: application/json" \\
    -d '${JSON.stringify(body)}'`;
  }, [requiredKeys, imagePrompt.hashId]);

  return (
    <>
      <table className="border-t w-full border-spacing-y-7 border-spacing-x-3 border-separate">
        <tbody className="align-top">
          <tr>
            <td className="w-40">
              <div className="font-bold">{imagePrompt.provider}</div>
            </td>
            <td>
              <div>{imagePrompt.model}</div>
            </td>
          </tr>
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
              <div className="font-bold image-nowrap">{`What you'll get`}</div>
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
          <tr>
            <td>
              <Button onClick={onClickTry} loading={loading}>
                Try
              </Button>
            </td>
            <td>
              <div>
                <Textarea
                  className="border rounded p-1 resize-none w-full h-40"
                  useValue={[example.input, setInput]}
                  disabled={loading}
                />
                <div className="image-sm image-rose-500 mb-3">
                  {inputErrorMessage}
                </div>
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
            <td>Url</td>
            <td className="whitespace-pre text-wrap">
              <div>{example.url}</div>
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
        </tbody>
      </table>
      <Login open={loginOpen} onClickLogin={() => setLoginOpen(false)} />
    </>
  );
}
