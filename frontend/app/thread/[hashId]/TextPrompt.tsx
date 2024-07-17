"use client";

import { TextPrompt as TextPromptType } from "gpinterface-shared/type";
import Collapsible from "@/components/general/collapsible";
import { stringify } from "@/util/string";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@radix-ui/themes";
import { getRequiredKeys } from "gpinterface-shared/string";
import callApi from "@/util/callApi";
import Textarea from "@/components/general/inputs/Textarea";
import { TextPromptExecuteResponse } from "gpinterface-shared/type/textPrompt";
import Login from "@/components/general/dialogs/Login";
import useUserStore from "@/store/user";
import EstimatedPrice from "@/components/general/hover/EstimatedPrice";

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
  const requiredKeys = useMemo(
    () => getRequiredKeys(JSON.stringify([systemMessage, messages])),
    [messages, systemMessage]
  );

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
      const response = await callApi<TextPromptExecuteResponse>({
        endpoint: `/text/prompt/${textPrompt.hashId}`,
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
  }, [user, example.input, requiredKeys, textPrompt.hashId]);

  const curl = useMemo(() => {
    const body = requiredKeys.reduce((obj, key) => {
      obj[key] = "value";
      return obj;
    }, {} as any);

    return `curl -X POST ${process.env.NEXT_PUBLIC_SERVICE_ENDPOINT}/text/${
      textPrompt.hashId
    } \\
    -H "Authorization: Bearer {your_api_key}" \\
    -H "Content-Type: application/json" \\
    -d '${JSON.stringify(body)}'`;
  }, [requiredKeys, textPrompt.hashId]);

  return (
    <>
      <table className="border-t w-full border-spacing-y-7 border-spacing-x-3 border-separate">
        <tbody className="align-top">
          <tr>
            <td className="w-40">
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
              <div className="font-bold image-nowrap">{`What you'll get`}</div>
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
              <div className="font-bold">Input</div>
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
            <td className="font-bold">Try</td>
            <td>
              <Button onClick={onClickTry} loading={loading}>
                Run
              </Button>
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
      <Login open={loginOpen} onClickLogin={() => setLoginOpen(false)} />
    </>
  );
}
