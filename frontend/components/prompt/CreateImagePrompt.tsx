"use client";

import IndentTextarea from "../general/inputs/IndentTextarea";
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
  ImagePromptDraftExecuteSchema,
  ImagePromptExecuteResponse,
  ImagePromptSchema,
} from "gpinterface-shared/type/imagePrompt";
import { Static } from "@sinclair/typebox";
import Collapsible from "../general/collapsible";
import Radio from "../general/inputs/Radio";
import useLinkConfirmMessage from "@/hooks/useLinkConfirmMessage";
import { PostGetResponse } from "gpinterface-shared/type/post";
import useImageModel, { ConfigSelectType } from "@/hooks/useImageModel";
import EstimatedPrice from "../general/hover/EstimatedPrice";
import { getValidBody } from "gpinterface-shared/util";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Textarea } from "../ui";
import Title from "../thread/Title";
import Provider from "../general/selects/Provider";
import { PlayCircle, RotateCcw } from "lucide-react";
import Footer from "./Footer";

const defaultPrompt =
  "The {{subject}} teacher is teaching a class at the {{school}}";
const defaultInputs = [
  { name: "subject", value: "math" },
  { name: "school", value: "high school" },
];
const defaultExample = { url: "", response: null as any, price: 0 };

export default function CreateImagePrompt({
  useIsPublic,
  callCreate,
  useLoading,
  responsePost,
}: {
  useIsPublic: [boolean, (i: boolean) => void];
  callCreate: (
    imagePrompt: Static<typeof ImagePromptSchema>
  ) => Promise<{ hashId: string } | undefined>;
  useLoading: [boolean, (l: boolean) => void];
  responsePost?: PostGetResponse | undefined;
}) {
  const [loading, setLoading] = useLoading;

  const {
    useProvider,
    useModel,
    useConfig,
    useConfigSelects,
    onClickResetConfig,
    models,
  } = useImageModel();
  const [provider, setProvider] = useProvider;
  const [model, setModel] = useModel;
  const [config, setConfig] = useConfig;
  const [configSelects, setConfigSelects] = useConfigSelects;

  const [prompt, setPrompt] = useState(defaultPrompt);
  const [example, setExample] = useState(defaultExample);
  const [inputs, setInputs] = useState(defaultInputs);

  useEffect(() => {
    if (!responsePost) return;

    const { imagePrompts } = responsePost.post;
    if (imagePrompts.length > 0) {
      const imagePrompt = imagePrompts[0];
      setProvider(imagePrompt.provider);
      const _model = models.find((m) => m.name === imagePrompt.model);
      if (!_model) {
        return;
      }
      setModel(_model);
      const _config: any = _model.config;
      const _configSelects: ConfigSelectType = {};
      Object.keys(_config).forEach((key) => {
        const value = (imagePrompt.config as any)[key];
        if (imagePrompt.config.hasOwnProperty(key)) {
          _config[key] = value;
        } else {
          _configSelects[key] = value;
        }
      });
      setConfig(stringify(_config));
      setConfigSelects(_configSelects);
      setPrompt(imagePrompt.prompt);

      const { examples } = imagePrompt;
      if (examples.length > 0) {
        const _example = examples[0];
        setExample(_example);
        setInputs(objectToInputs(_example.input));
      }
    }
  }, [
    responsePost,
    setProvider,
    setModel,
    setConfig,
    setConfigSelects,
    models,
  ]);

  useEffect(() => {
    const keys = getKeys(prompt);
    setInputs((prev) => getKeyAlignedInput(keys, prev));
  }, [prompt]);
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

    setExample((prev) => ({ ...prev, url: "", response: null, price: 0 }));
  }, [responsePost, provider, model, config, configSelects]);

  const configBody = useMemo(() => {
    const _config: any = {};
    if (!config || !configSelects) return config;

    const mergedConfig = { ...JSON.parse(config), ...configSelects };
    Object.keys(mergedConfig).forEach((key) => {
      const value = mergedConfig[key];
      if (value !== "NONE") {
        _config[key] =
          value === "true" ? true : value === "false" ? false : value;
      }
    });
    if (_config.hasOwnProperty("dimensions")) {
      const [height, width] = _config.dimensions.split("x");
      _config.height = parseInt(height);
      _config.width = parseInt(width);
    }
    delete _config.engine_id;
    delete _config.dimensions;
    return _config;
  }, [config, configSelects]);

  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const onClickTest = useCallback(async () => {
    try {
      if (!model) {
        alert("Please select model and try again");
        return;
      } else if (prompt.trim().length === 0) {
        alert("Please write prompt and try again");
        return;
      }

      const input = getValidBody(prompt, inputsToObject(inputs));
      setInputErrorMessage("");

      setLoading(true);
      const response = await callApi<
        ImagePromptExecuteResponse,
        Static<typeof ImagePromptDraftExecuteSchema>
      >({
        endpoint: "/image/prompt/draft",
        method: "POST",
        body: {
          input,
          provider,
          model: model.name,
          prompt,
          config: configBody,
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
  }, [inputs, provider, model, prompt, configBody, setLoading]);

  const onClickCreate = useCallback(async () => {
    if (!model) {
      alert("Please select the model");
      return;
    } else if (prompt.length === 0) {
      alert("Please write the prompt");
      return;
    } else if (example.url.length === 0) {
      alert("Please complete the image generation test");
      return;
    }

    await callCreate({
      provider,
      model: model.name,
      prompt,
      config: configBody,
      examples: [{ ...example, input: inputsToObject(inputs) }],
    });
  }, [callCreate, provider, model, prompt, configBody, example, inputs]);

  useLinkConfirmMessage(models.length > 0 && provider !== models[0].name);

  const router = useRouter();
  const onClickCancel = useCallback(() => router.back(), [router]);

  return (
    <div className="grid grid-cols-[8rem_auto_1fr] gap-3 md:gap-7 items-center">
      <Title>Model</Title>
      <div>
        <Provider.ImageProvider
          useProvider={[provider, setProvider]}
          disabled={responsePost?.thread.isPublic || loading}
        />
      </div>
      <div>
        <Provider.ImageModel
          models={models}
          useModel={[model, setModel]}
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
      <div className="col-span-2 self-start">
        <div className="mt-2">
          <Collapsible>
            <div className="flex flex-col gap-3 items-start">
              <IndentTextarea
                className="w-full h-40"
                placeholder="advanced config"
                useValue={[config, setConfig]}
                disabled={loading || responsePost?.thread.isPublic}
              />
              <div className="grid grid-cols-[auto_1fr] gap-3 w-full items-center">
                {model.configSelects.map((c) => (
                  <Fragment key={c.name}>
                    <div className="text-xs md:text-sm">{c.title}</div>
                    <Radio
                      options={c.values}
                      useOption={[
                        configSelects[c.name],
                        (option) => {
                          setConfigSelects((prev) => {
                            const newConfigSelects = { ...prev };
                            newConfigSelects[c.name] = option;
                            return newConfigSelects;
                          });
                        },
                      ]}
                      disabled={responsePost?.thread.isPublic || loading}
                    />
                  </Fragment>
                ))}
              </div>
            </div>
          </Collapsible>
        </div>
      </div>
      <Title>Prompt</Title>
      <div className="col-span-2">
        <Textarea
          className="w-full h-20"
          placeholder="image generation prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.currentTarget.value)}
          disabled={loading || responsePost?.thread.isPublic}
        />
      </div>
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
          <div>
            <Textarea
              placeholder={i.name}
              value={i.value}
              onChange={(e) => setExampleInput(index)(e.currentTarget.value)}
              disabled={loading || responsePost?.thread.isPublic}
              className="min-h-0 h-10"
            />
          </div>
        </Fragment>
      ))}
      {example.url.length > 0 && (
        <>
          <Title>Generated image</Title>
          <div className="col-span-2">
            <div className="w-full h-80">
              <picture>
                <img
                  className="h-full"
                  src={example.url}
                  alt="ai_generated_image"
                />
              </picture>
            </div>
          </div>
          <Title>URL</Title>
          <div className="col-span-2 text-xs md:text-sm">
            <div className="whitespace-pre text-wrap">
              <a target="_blank" href={example.url}>
                {example.url}
              </a>
            </div>
          </div>
          <EstimatedPrice />
          <div className="col-span-2 text-xs md:text-sm">
            <div className="whitespace-pre text-wrap">${example.price}</div>
          </div>
          <Title>Response</Title>
          <div className="col-span-2 text-xs md:text-sm">
            <Collapsible>
              <Card>
                <CardContent className="p-3">
                  {stringify(example.response)}
                </CardContent>
              </Card>
            </Collapsible>
          </div>
        </>
      )}
      <div className="col-span-3">
        <Footer
          useIsPublic={[...useIsPublic, !responsePost]}
          onClickCancel={onClickCancel}
          onClickCreate={onClickCreate}
          createText={!!responsePost ? "Save" : "Create"}
          loading={loading}
        />
      </div>
    </div>
  );
}
