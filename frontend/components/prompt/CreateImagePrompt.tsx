"use client";

import { Button } from "@radix-ui/themes";
import Textarea from "../general/inputs/Textarea";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { stringify } from "@/util/string";
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
import useUserStore from "@/store/user";
import Login from "../general/dialogs/Login";
import useImageModel, { ConfigSelectType } from "@/hooks/useImageModel";
import { imageModels } from "gpinterface-shared/models/image/model";
import EstimatedPrice from "../general/hover/EstimatedPrice";
import { getValidBody } from "gpinterface-shared/util";
import { useRouter } from "next/navigation";

const defaultPrompt =
  "The {{subject}} teacher is teaching a class at the {{school}}";
const defaultExample = {
  input: '{"subject": "math", "school": "high school"}',
  url: "",
  response: null as any,
  price: 0,
};

export default function CreateImagePrompt({
  callCreate,
  useLoading,
  responsePost,
}: {
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
        setExample({ ..._example, input: JSON.stringify(_example.input) });
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

  const setExampleInput = useCallback(
    (input: string) => setExample((prev) => ({ ...prev, input })),
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

  const { user } = useUserStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const onClickTest = useCallback(async () => {
    try {
      if (!user) {
        setLoginOpen(true);
        return;
      }
      if (!model) {
        alert("Please select model and try again");
        return;
      } else if (prompt.trim().length === 0) {
        alert("Please write prompt and try again");
        return;
      }

      const input = getValidBody(prompt, JSON.parse(example.input));
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
  }, [user, example.input, provider, model, prompt, configBody, setLoading]);

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
      examples: [{ ...example, input: JSON.parse(example.input) }],
    });
  }, [callCreate, provider, model, prompt, configBody, example]);

  useLinkConfirmMessage(models.length > 0 && provider !== models[0].name);

  const router = useRouter();
  const onClickCancel = useCallback(() => router.back(), [router]);

  return (
    <>
      <div className="w-full flex items-center gap-3">
        <Radio.ImageProvider
          useProvider={[provider, setProvider]}
          loading={loading}
          disabled={responsePost?.thread.isPublic}
        />
      </div>
      {models.length > 0 && (
        <div className="w-full flex items-center gap-3">
          <Radio.ImageModel
            models={models}
            useModel={[model, setModel]}
            loading={loading}
            disabled={responsePost?.thread.isPublic}
          />
        </div>
      )}
      <div className="overflow-x-auto">
        {provider !== imageModels[0].provider && (
          <table className="w-full border-spacing-y-7 border-spacing-x-3 border-separate">
            <tbody className="align-top">
              <tr>
                <td className="w-24 md:w-40">
                  <div className="font-bold text-nowrap">Prompt</div>
                </td>
                <td>
                  <textarea
                    className="w-full focus:outline-none border border-px rounded p-1 resize-none h-20"
                    placeholder="image generation prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.currentTarget.value)}
                    disabled={loading || responsePost?.thread.isPublic}
                  />
                </td>
              </tr>
              {!!model && (
                <tr>
                  <td>
                    <div className="font-bold text-nowrap">Config</div>
                  </td>
                  <td>
                    <Collapsible>
                      <div className="flex flex-col gap-3 items-start">
                        <Textarea
                          className="w-full focus:outline-none border border-px rounded p-1 resize-none h-80"
                          placeholder="advanced config"
                          useValue={[config, setConfig]}
                          disabled={loading || responsePost?.thread.isPublic}
                        />
                        <div className="grid grid-cols-[auto_1fr] gap-3 w-full">
                          {model.configSelects.map((c) => (
                            <Fragment key={c.name}>
                              <div>{c.title}</div>
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
                                loading={loading}
                                disabled={responsePost?.thread.isPublic}
                              />
                            </Fragment>
                          ))}
                        </div>
                        <Button
                          size="1"
                          onClick={onClickResetConfig}
                          loading={loading}
                          disabled={responsePost?.thread.isPublic}
                        >
                          Reset to Default
                        </Button>
                      </div>
                    </Collapsible>
                  </td>
                </tr>
              )}
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
                  <Textarea
                    className="border rounded p-1 resize-none w-full h-40"
                    useValue={[example.input, setExampleInput]}
                    disabled={loading || responsePost?.thread.isPublic}
                  />
                  <div className="text-sm text-rose-500 mb-3">
                    {inputErrorMessage}
                  </div>
                </td>
              </tr>
              {example.url.length > 0 && (
                <>
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
                        <div className="whitespace-pre text-wrap">
                          ${example.price}
                        </div>
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
                </>
              )}
            </tbody>
          </table>
        )}
      </div>
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
      <Login open={loginOpen} onClickLogin={() => setLoginOpen(false)} />
    </>
  );
}
