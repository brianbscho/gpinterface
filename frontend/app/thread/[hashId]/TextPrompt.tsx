"use client";

import { TextPrompt as TextPromptType } from "gpinterface-shared/type";
import Collapsible from "@/components/general/collapsible";
import { stringify } from "@/util/string";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@radix-ui/themes";
import callApi from "@/util/callApi";
import Textarea from "@/components/general/inputs/Textarea";
import { TextPromptExecuteResponse } from "gpinterface-shared/type/textPrompt";
import EstimatedPrice from "@/components/general/hover/EstimatedPrice";
import { getValidBody } from "gpinterface-shared/util";
import UserRequiredButton from "@/components/general/buttons/UserRequiredButton";

export default function TextPrompt({
  textPrompt,
}: {
  textPrompt: TextPromptType;
}) {
  const { systemMessage, messages, examples } = textPrompt;
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

  const onClickTry = useCallback(async () => {
    try {
      const input = getValidBody(
        JSON.stringify([systemMessage, messages]),
        JSON.parse(example.input)
      );
      setInputErrorMessage("");

      setLoading(true);
      const response = await callApi<TextPromptExecuteResponse>({
        endpoint: `/text/prompt/${textPrompt.hashId}`,
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
  }, [example.input, systemMessage, messages, textPrompt.hashId]);

  const curl = useMemo(() => {
    if (examples.length === 0) return "";

    const input = Object.keys(examples[0].input)
      .map((k) => `"${k}": "some_value"`)
      .join(", ");

    return `curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/text/${textPrompt.hashId} \\
    -H "Authorization: Bearer {your_api_key}" \\
    -H "Content-Type: application/json" \\
    -d '{${input}}'`;
  }, [examples, textPrompt.hashId]);

  return (
    <>
      <table className="border-t w-full border-spacing-y-7 border-spacing-x-3 border-separate">
        <tbody className="align-top">
          <tr>
            <td className="w-28 md:w-40">
              <div className="font-bold">{textPrompt.provider}</div>
            </td>
            <td>
              <div>{textPrompt.model}</div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="font-bold text-nowrap">Messages</div>
            </td>
          </tr>
          {systemMessage.length > 0 && (
            <tr>
              <td className="text-sm">system</td>
              <td className="text-sm whitespace-pre">{systemMessage}</td>
            </tr>
          )}
          {messages.map((m, index) => (
            <tr key={`message_${index}`}>
              <td className="text-sm">{m.role}</td>
              <td className="text-sm whitespace-pre">{m.content}</td>
            </tr>
          ))}
          <tr>
            <td>
              <div className="font-bold text-nowrap">Config</div>
            </td>
            <td>
              <div>
                <Collapsible>
                  <div className="border rounded p-1 whitespace-pre">
                    {stringify(textPrompt.config)}
                  </div>
                </Collapsible>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="font-bold text-nowrap">How to call</div>
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
                  content: example.content,
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
              <UserRequiredButton onClick={onClickTry}>
                <Button loading={loading}>Try</Button>
              </UserRequiredButton>
            </td>
            <td>
              <div>
                <Textarea
                  className="border rounded p-1 resize-none w-full h-40"
                  useValue={[example.input, setInput]}
                  disabled={loading}
                />
                <div className="text-sm text-rose-500 mb-3">
                  {inputErrorMessage}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="font-bold">Output</div>
            </td>
            <td>
              <div>
                <div className="whitespace-pre text-wrap">
                  {example.content}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="font-bold">
                <EstimatedPrice />
              </div>
            </td>
            <td>
              <div>
                <div className="whitespace-pre text-wrap">${example.price}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="font-bold">Response</div>
            </td>
            <td>
              <div>
                <Collapsible>
                  <div className="border rounded p-1">
                    <pre className="whitespace-pre text-wrap">
                      {example.response ? stringify(example.response) : ""}
                    </pre>
                  </div>
                </Collapsible>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
