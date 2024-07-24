"use client";

import { Button, Select } from "@radix-ui/themes";
import Textarea from "../general/inputs/Textarea";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  getKeyAlignedInput,
  getKeys,
  inputsToObject,
  objectToInputs,
  stringify,
} from "@/util/string";
import callApi from "@/util/callApi";
import {
  TextPromptDraftExecuteSchema,
  TextPromptExecuteResponse,
  TextPromptSchema,
} from "gpinterface-shared/type/textPrompt";
import { Static } from "@sinclair/typebox";
import Collapsible from "../general/collapsible";
import { getBasePrice, textModels } from "gpinterface-shared/models/text/model";
import useTextModel from "@/hooks/useTextModel";
import Radio from "../general/inputs/Radio";
import useLinkConfirmMessage from "@/hooks/useLinkConfirmMessage";
import { PostGetResponse } from "gpinterface-shared/type/post";
import { TrashIcon } from "@radix-ui/react-icons";
import { TextMessageSchema } from "gpinterface-shared/type/textMessage";
import EstimatedPrice from "../general/hover/EstimatedPrice";
import { getValidBody } from "gpinterface-shared/util";
import { useRouter } from "next/navigation";
import UserRequiredButton from "../general/buttons/UserRequiredButton";

const defaultSystemMessage = "{{systemMessage}}";

const defaultMessage: Static<typeof TextMessageSchema> = {
  role: "user",
  content: "What is {{a}} + {{b}}?",
};

const defaultExample = {
  content: "",
  response: null as any,
  price: 0,
};

const defaultInputs = [
  { name: "systemMessage", value: "You are a helpful math teacher." },
  { name: "a", value: "1" },
  { name: "b", value: "2" },
];

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
  const [inputs, setInputs] = useState(defaultInputs);

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
        setExample(_example);
        setInputs(objectToInputs(_example.input));
      }
    }
  }, [responsePost, setProvider, setModel, setConfig]);

  const setMessage = useCallback(
    (index: number) => (message: { role?: string; content?: string }) =>
      setMessages((prev) => {
        const newMessage = [...prev];
        newMessage[index] = { ...newMessage[index], ...message };
        return newMessage;
      }),
    [setMessages]
  );
  useEffect(() => {
    const keys = getKeys(JSON.stringify([systemMessage, messages]));
    setInputs((prev) => getKeyAlignedInput(keys, prev));
  }, [systemMessage, messages]);

  const setExampleInput = useCallback(
    (index: number) => (value: string) =>
      setInputs((prev) => {
        const newInputs = [...prev];
        newInputs[index].value = value;
        return newInputs;
      }),
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

  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const onClickTest = useCallback(async () => {
    try {
      const input = getValidBody(
        JSON.stringify([systemMessage, messages]),
        inputsToObject(inputs)
      );
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
          input,
          messages,
        },
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
  }, [provider, model, config, inputs, systemMessage, messages, setLoading]);

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
      examples: [{ ...example, input: inputsToObject(inputs) }],
    });
  }, [
    callCreate,
    example,
    inputs,
    messages,
    config,
    model,
    provider,
    systemMessage,
  ]);

  useLinkConfirmMessage(provider !== textModels[0].provider);

  const router = useRouter();
  const onClickCancel = useCallback(() => router.back(), [router]);

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
        <table className="w-full">
          <tbody className="align-top">
            <tr>
              <td className="w-28 md:w-40">
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
              <td className="text-sm">
                system
                <br />
                (optional)
              </td>
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
                <UserRequiredButton onClick={onClickTest}>
                  <Button
                    loading={loading}
                    disabled={responsePost?.thread.isPublic}
                  >
                    Test
                  </Button>
                </UserRequiredButton>
                <div className="text-sm text-rose-500 mb-3">
                  {inputErrorMessage}
                </div>
              </td>
              <td>
                <div className="grid grid-cols-[auto_1fr] gap-3 w-full">
                  {inputs.map((i, index) => (
                    <Fragment key={i.name}>
                      <div>{i.name}</div>
                      <Textarea
                        className="focus:outline-none border border-px rounded p-1 resize-none h-40"
                        placeholder={i.name}
                        useValue={[i.value, setExampleInput(index)]}
                        disabled={loading || responsePost?.thread.isPublic}
                      />
                    </Fragment>
                  ))}
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-28 md:w-40">
                <div className="font-bold text-nowrap">Base price</div>
              </td>
              <td>{getBasePrice(model)}</td>
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
      <div className="flex justify-end gap-3 pb-3">
        <div>
          <Button variant="soft" onClick={onClickCancel}>
            Cancel
          </Button>
        </div>
        <div>
          <Button onClick={onClickCreate} loading={loading}>
            {!!responsePost ? "Save" : "Create"}
          </Button>
        </div>
      </div>
    </>
  );
}
