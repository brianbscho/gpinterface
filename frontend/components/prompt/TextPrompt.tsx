"use client";

import { TextPrompt as TextPromptType } from "gpinterface-shared/type";
import Collapsible from "@/components/general/collapsible";
import { inputsToObject, objectToInputs, stringify } from "@/util/string";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Button } from "@radix-ui/themes";
import callApi from "@/util/callApi";
import Textarea from "@/components/general/inputs/Textarea";
import { TextPromptExecuteResponse } from "gpinterface-shared/type/textPrompt";
import EstimatedPrice from "@/components/general/hover/EstimatedPrice";
import { getValidBody } from "gpinterface-shared/util";
import UserRequiredButton from "@/components/general/buttons/UserRequiredButton";
import { getBasePrice } from "gpinterface-shared/models/text/model";

export default function TextPrompt({
  textPrompt,
}: {
  textPrompt: TextPromptType;
}) {
  const { systemMessage, messages, examples } = textPrompt;
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
      const input = getValidBody(
        JSON.stringify([systemMessage, messages]),
        inputsToObject(inputs)
      );
      setInputErrorMessage("");

      setLoading(true);
      setExample({
        hashId: "",
        input: {},
        content: "",
        response: {},
        price: 0,
      });
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
  }, [inputs, systemMessage, messages, textPrompt.hashId]);

  const curl = useMemo(() => {
    const input = inputs.map((i) => `"${i.name}": "some_value"`).join(", ");

    return `curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/text/${textPrompt.hashId} \\
    -H "Authorization: Bearer {your_api_key}" \\
    -H "Content-Type: application/json" \\
    -d '{${input}}'`;
  }, [inputs, textPrompt.hashId]);

  return (
    <>
      <table className="w-full">
        <tbody className="align-top">
          <tr>
            <td>
              <div className="font-bold text-nowrap">Messages</div>
            </td>
          </tr>
          {systemMessage.length > 0 && (
            <tr>
              <td className="text-sm">system</td>
              <td className="whitespace-pre">{systemMessage}</td>
            </tr>
          )}
          {messages.map((m, index) => (
            <tr key={`message_${index}`}>
              <td className="text-sm">{m.role}</td>
              <td className="whitespace-pre">{m.content}</td>
            </tr>
          ))}
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
          <tr>
            <td className="w-28 md:w-40">
              <div className="font-bold">{textPrompt.provider}</div>
            </td>
            <td>
              <div>{textPrompt.model}</div>
              <div>{getBasePrice(textPrompt.model)}</div>
            </td>
          </tr>
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
        </tbody>
      </table>
    </>
  );
}
