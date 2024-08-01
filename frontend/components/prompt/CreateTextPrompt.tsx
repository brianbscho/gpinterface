"use client";

import IndentTextarea from "../general/inputs/IndentTextarea";
import { Fragment, useCallback, useEffect, useState } from "react";
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
import { getBasePrice } from "gpinterface-shared/models/text/model";
import useTextModel from "@/hooks/useTextModel";
import useLinkConfirmMessage from "@/hooks/useLinkConfirmMessage";
import { PostGetResponse } from "gpinterface-shared/type/post";
import { TextMessageSchema } from "gpinterface-shared/type/textMessage";
import EstimatedPrice from "../general/hover/EstimatedPrice";
import { getValidBody } from "gpinterface-shared/util";
import { useRouter } from "next/navigation";
import { PlayCircle, PlusCircle, RotateCcw, Trash2 } from "lucide-react";
import { Button, Textarea } from "../ui";
import Title from "../thread/Title";
import Provider from "../general/selects/Provider";
import Footer from "./Footer";
import Select from "../general/selects/Select";

const defaultMessage: Static<typeof TextMessageSchema> = {
  role: "user",
  content: "What is {{a}} + {{b}}?",
};

const defaultExample = { content: "", response: null as any, price: 0 };

const defaultInputs = [
  { name: "a", value: "1" },
  { name: "b", value: "2" },
];

export default function CreateTextPrompt({
  useIsPublic,
  callCreate,
  useLoading,
  responsePost,
}: {
  useIsPublic: [boolean, (i: boolean) => void];
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
  const [systemMessage, setSystemMessage] = useState("");

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
    if (messages.length === 0 || messages.some((m) => m.content.length === 0)) {
      alert("Please write the prompt message");
      return;
    } else if (messages[messages.length - 1].role !== "user") {
      alert("Messages should end with user's message.");
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

  useLinkConfirmMessage(true);

  const router = useRouter();
  const onClickCancel = useCallback(() => router.back(), [router]);

  return (
    <div className="grid grid-cols-[8rem_auto_1fr_auto] gap-3 md:gap-7 items-center">
      <Title>Model</Title>
      <div>
        <Provider.TextProvider
          useProvider={[provider, setProvider]}
          disabled={responsePost?.thread.isPublic || loading}
        />
      </div>
      <div className="col-span-2">
        <Select
          options={models}
          useOption={[model, setModel]}
          disabled={responsePost?.thread.isPublic || loading}
        />
      </div>
      <div className="self-start">
        <div className="flex items-center gap-1">
          <Title>Config</Title>
          <Button
            onClick={onClickResetConfig}
            loading={loading}
            disabled={responsePost?.thread.isPublic}
            className="rounded-full w-7 h-7 p-1"
          >
            <RotateCcw />
          </Button>
        </div>
      </div>
      <div className="col-span-3 self-start">
        <div className="mt-2">
          <Collapsible>
            <IndentTextarea
              className="w-full h-80"
              placeholder="advanced config"
              useValue={[config, setConfig]}
              disabled={loading || responsePost?.thread.isPublic}
            />
          </Collapsible>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Title>Messages</Title>
        <Button
          onClick={onClickAddMessages}
          loading={loading}
          disabled={responsePost?.thread.isPublic}
          className="rounded-full w-7 h-7 p-1 shrink-0"
        >
          <PlusCircle />
        </Button>
      </div>
      <div className="text-sm leading-10">system (optional)</div>
      <div className="col-span-2">
        <Textarea
          resizing
          placeholder="system message (optional)"
          value={systemMessage}
          onChange={(e) => setSystemMessage(e.currentTarget.value)}
          disabled={loading || responsePost?.thread.isPublic}
        />
      </div>
      {messages.map((m, index) => (
        <Fragment key={`message_${index}`}>
          <div></div>
          <div>
            <Select
              options={["user", "assistant"]}
              useOption={[m.role, (v) => setMessage(index)({ role: v })]}
              disabled={loading || responsePost?.thread.isPublic}
            />
          </div>
          <div>
            <Textarea
              resizing
              placeholder="message"
              value={m.content}
              onChange={(e) =>
                setMessage(index)({ content: e.currentTarget.value })
              }
              disabled={loading || responsePost?.thread.isPublic}
            />
          </div>
          <div>
            <Button
              onClick={() => onClickDeleteMessage(index)}
              loading={loading}
              disabled={responsePost?.thread.isPublic}
            >
              <Trash2 />
            </Button>
          </div>
        </Fragment>
      ))}
      <div>
        <div className="flex items-center gap-1">
          <Title>Test</Title>
          <Button
            onClick={onClickTest}
            loading={loading}
            disabled={responsePost?.thread.isPublic}
            className="rounded-full w-7 h-7 p-1"
          >
            <PlayCircle />
          </Button>
        </div>
        <div className="text-sm text-rose-500">{inputErrorMessage}</div>
      </div>
      {inputs.map((i, index) => (
        <Fragment key={i.name}>
          {index > 0 && <div></div>}
          <div className="text-sm">{i.name}</div>
          <div className="col-span-2">
            <Textarea
              placeholder={i.name}
              value={i.value}
              onChange={(e) => setExampleInput(index)(e.currentTarget.value)}
              disabled={loading || responsePost?.thread.isPublic}
              resizing
            />
          </div>
        </Fragment>
      ))}
      {example.content.length > 0 && example.response !== null && (
        <>
          <Title>Content</Title>
          <div className="col-span-3 text-xs md:text-sm whitespace-pre text-wrap">
            {example.content}
          </div>
        </>
      )}
      <Title>Base price</Title>
      <div className="col-span-3 text-xs md:text-sm">{getBasePrice(model)}</div>
      {example.content.length > 0 && example.response !== null && (
        <>
          <EstimatedPrice />
          <div className="col-span-3 text-xs md:text-sm">${example.price}</div>
          <Title>Response</Title>
          <div className="col-span-3 text-xs md:text-sm whitespace-pre text-wrap">
            {stringify(example.response)}
          </div>
        </>
      )}
      <div className="col-span-4">
        <Footer
          useIsPublic={[...useIsPublic, !responsePost]}
          onClickCancel={!responsePost ? onClickCancel : undefined}
          onClickCreate={onClickCreate}
          createText={!!responsePost ? "Save" : "Create"}
          loading={loading}
        />
      </div>
    </div>
  );
}
