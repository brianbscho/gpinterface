"use client";

import { Button, Select } from "@radix-ui/themes";
import Textarea from "../general/inputs/Textarea";
import { useCallback, useEffect, useMemo, useState } from "react";
import { stringify } from "@/util/string";
import { getRequiredKeys } from "gpinterface-shared/string";
import callApi from "@/util/callApi";
import {
  TextPromptDraftExecuteSchema,
  TextPromptExecuteResponse,
  TextPromptSchema,
} from "gpinterface-shared/type/textPrompt";
import { Static } from "@sinclair/typebox";
import Collapsible from "../general/collapsible";
import { textModels } from "gpinterface-shared/models/text/model";
import useTextModel from "@/hooks/useTextModel";
import Radio from "../general/inputs/Radio";
import useLinkConfirmMessage from "@/hooks/useLinkConfirmMessage";
import { PostGetResponse } from "gpinterface-shared/type/post";
import useUserStore from "@/store/user";
import Login from "../general/dialogs/Login";
import { TrashIcon } from "@radix-ui/react-icons";
import { TextMessageSchema } from "gpinterface-shared/type/textMessage";
import { TextExampleSchema } from "gpinterface-shared/type/textExample";
import EstimatedPrice from "../general/hover/EstimatedPrice";

const defaultSystemMessage = "{{systemMessage}}";

const defaultMessage: Static<typeof TextMessageSchema> = {
  role: "user",
  content: "What is {{a}} + {{b}}?",
};

const defaultExample: Static<typeof TextExampleSchema> = {
  input: '{"systemMessage": "You are a helpful math teacher.", "a": 1, "b": 2}',
  content: "",
  response: null as any,
  price: 0,
};

export default function CreateTextPrompt({
  callCreate,
  useLoading,
  responsePost,
}: {
  callCreate: (
    textPrompt: Static<typeof TextPromptSchema>
  ) => Promise<{ hashId: string } | undefined>;
  useLoading: [boolean, (l: boolean) => void];
  responsePost?: PostGetResponse | undefined;
}) {
  const [loading, setLoading] = useLoading;

  const { useProvider, useModel, useConfig, onClickResetConfig, models } =
    useTextModel();
  const [provider, setProvider] = useProvider;
  const [model, setModel] = useModel;
  const [config, setConfig] = useConfig;
  const [systemMessage, setSystemMessage] = useState(defaultSystemMessage);

  const [messages, setMessages] = useState([defaultMessage]);
  const [example, setExample] = useState(defaultExample);

  useEffect(() => {
    if (!responsePost) return;

    const { textPrompts } = responsePost.post;
    if (textPrompts.length > 0) {
      const textPrompt = textPrompts[0];
      setProvider(textPrompt.provider);
      setModel(textPrompt.model);
      setConfig(stringify(textPrompt.config));
      setSystemMessage(textPrompt.systemMessage);
      setMessages(textPrompt.messages);

      const { examples } = textPrompt;
      if (examples.length > 0) {
        const _example = examples[0];
        setExample({ ..._example, input: JSON.stringify(_example.input) });
      }
    }
  }, [responsePost, setProvider, setModel, setConfig]);

  const requiredKeys = useMemo(
    () => getRequiredKeys(JSON.stringify([systemMessage, messages])),
    [systemMessage, messages]
  );

  const setMessage = useCallback(
    (index: number) => (message: { role?: string; content?: string }) =>
      setMessages((prev) => {
        const newMessage = [...prev];
        newMessage[index] = { ...newMessage[index], ...message };
        return newMessage;
      }),
    [setMessages]
  );

  const setExampleInput = useCallback(
    (input: string) => setExample((prev) => ({ ...prev, input })),
    []
  );

  useEffect(() => {
    if (responsePost) return;

    setExample((prev) => ({ ...prev, content: "", response: null, price: 0 }));
  }, [responsePost, provider, model, systemMessage, messages, config]);

  const onClickAddMessages = useCallback(() => {
    setMessages((prev) => {
      let role = "user";
      if (prev.length > 0 && prev[prev.length - 1].role === "user") {
        role = "assistant";
      }
      return [...prev, { role, content: "" }];
    });
  }, [setMessages]);
  const onClickDeleteMessage = useCallback((index: number) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      return newMessages.filter((_, i) => i !== index);
    });
  }, []);

  const { user } = useUserStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const onClickTest = useCallback(async () => {
    try {
      if (!user) {
        setLoginOpen(true);
        return;
      }

      const requestBody = JSON.parse(example.input);
      for (const key of requiredKeys) {
        if (!(key in requestBody)) {
          setInputErrorMessage(`${key} is missing`);
          return;
        }
      }
      setInputErrorMessage("");

      setLoading(true);
      const response = await callApi<
        TextPromptExecuteResponse,
        Static<typeof TextPromptDraftExecuteSchema>
      >({
        endpoint: "/text/prompt/draft",
        method: "POST",
        body: {
          provider,
          model,
          systemMessage,
          config: JSON.parse(config),
          input: JSON.parse(example.input),
          messages,
        },
        showError: true,
      });
      if (response) {
        setExample((prev) => ({ ...prev, ...response }));
      }
    } catch (e) {
      setInputErrorMessage("Provided JSON is invalid.");
    } finally {
      setLoading(false);
    }
  }, [
    user,
    requiredKeys,
    provider,
    model,
    config,
    example.input,
    systemMessage,
    messages,
    setLoading,
  ]);

  const onClickCreate = useCallback(async () => {
    if (messages.length === 0) {
      alert("Please write the prompt message");
      return;
    } else if (example.content.length === 0) {
      alert("Please complete the input test");
      return;
    }

    await callCreate({
      provider,
      model,
      systemMessage,
      messages,
      config: JSON.parse(config),
      examples: [{ ...example, input: JSON.parse(example.input) }],
    });
  }, [callCreate, example, messages, config, model, provider, systemMessage]);

  useLinkConfirmMessage(provider !== textModels[0].provider);

  return (
    <>
      <div className="w-full flex items-center gap-3">
        <Radio.TextProvider
          useProvider={[provider, setProvider]}
          loading={loading}
          disabled={responsePost?.thread.isPublic}
        />
      </div>
      {models.length > 0 && (
        <div className="w-full flex items-center gap-3">
          <Radio
            options={models}
            useOption={[model, setModel]}
            loading={loading}
            disabled={responsePost?.thread.isPublic}
          />
        </div>
      )}
      {provider !== textModels[0].provider && (
        <table className="w-full border-spacing-y-7 border-spacing-x-3 border-separate">
          <tbody className="align-top">
            <tr>
              <td className="w-40">
                <div className="font-bold text-nowrap">Messages</div>
              </td>
              <td>
                <Button
                  onClick={onClickAddMessages}
                  loading={loading}
                  disabled={responsePost?.thread.isPublic}
                >
                  Add messages
                </Button>
              </td>
            </tr>
            <tr>
              <td className="text-sm">system (optional)</td>
              <td>
                <textarea
                  className="w-full focus:outline-none border border-px rounded p-1 resize-none h-20"
                  placeholder="system message"
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.currentTarget.value)}
                  disabled={loading || responsePost?.thread.isPublic}
                />
              </td>
            </tr>
            {messages.map((m, index) => (
              <tr key={`message_${index}`}>
                <td>
                  <Select.Root
                    value={m.role}
                    onValueChange={(v) => setMessage(index)({ role: v })}
                    disabled={loading || responsePost?.thread.isPublic}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="user">user</Select.Item>
                      <Select.Item value="assistant">assistant</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </td>
                <td>
                  <div className="flex items-start gap-3">
                    <textarea
                      className="w-full focus:outline-none border border-px rounded p-1 resize-none h-20"
                      placeholder="message"
                      value={m.content}
                      onChange={(e) =>
                        setMessage(index)({ content: e.currentTarget.value })
                      }
                      disabled={loading || responsePost?.thread.isPublic}
                    />
                    <Button
                      onClick={() => onClickDeleteMessage(index)}
                      loading={loading}
                      disabled={responsePost?.thread.isPublic}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <div className="font-bold text-nowrap">Config</div>
              </td>
              <td>
                <Collapsible>
                  <Textarea
                    className="w-full focus:outline-none border border-px rounded p-1 resize-none h-80"
                    placeholder="advanced config"
                    useValue={[config, setConfig]}
                    disabled={loading || responsePost?.thread.isPublic}
                  />
                  <Button
                    size="1"
                    onClick={onClickResetConfig}
                    loading={loading}
                    disabled={responsePost?.thread.isPublic}
                  >
                    Reset to Default
                  </Button>
                </Collapsible>
              </td>
            </tr>
            <tr>
              <td>
                <Button
                  onClick={onClickTest}
                  loading={loading}
                  disabled={responsePost?.thread.isPublic}
                >
                  Test
                </Button>
              </td>
              <td>
                <input
                  className="w-full focus:outline-none border-b p-1"
                  value={example.input}
                  onChange={(e) => setExampleInput(e.currentTarget.value)}
                  disabled={loading || responsePost?.thread.isPublic}
                />
                <div className="text-sm text-rose-500 mb-3">
                  {inputErrorMessage}
                </div>
              </td>
            </tr>
            {example.content.length > 0 && example.response !== null && (
              <>
                <tr>
                  <td>Content</td>
                  <td className="whitespace-pre text-wrap">
                    <div>{example.content}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <EstimatedPrice />
                  </td>
                  <td>
                    <div>
                      <div className="whitespace-pre text-wrap">
                        ${example.price}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Response</td>
                  <td>
                    <div className="whitespace-pre text-wrap">
                      {stringify(example.response)}
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      )}
      <div className="flex justify-end pb-3">
        <div>
          <Button onClick={onClickCreate} loading={loading}>
            {!!responsePost ? "Save" : "Create Thread"}
          </Button>
        </div>
      </div>
      <Login open={loginOpen} onClickLogin={() => setLoginOpen(false)} />
    </>
  );
}
