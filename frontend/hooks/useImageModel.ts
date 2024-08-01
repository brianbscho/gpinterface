"use client";

import { stringify } from "@/util/string";
import { imageModels } from "gpinterface-shared/models/image/model";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ModelType = {
  name: string;
  config: any;
  configSelects: {
    title: string;
    name: string;
    values: (string | number)[];
  }[];
};
export type ConfigSelectType = { [key: string]: string | number };
export default function useImageModel() {
  const [provider, setProvider] = useState(imageModels[0].provider);
  const [config, setConfig] = useState("{}");
  const [configSelects, setConfigSelects] = useState<ConfigSelectType>({});

  const aiIndex = useMemo(() => {
    const index = imageModels.findIndex((m) => m.provider === provider);
    return index > -1 ? index : 0;
  }, [provider]);
  const models = useMemo(() => imageModels[aiIndex].models, [aiIndex]);

  const [model, setModel] = useState<ModelType>(models[0]);
  useEffect(() => setModel(models[0]), [models]);

  const onClickResetConfig = useCallback(() => {
    setConfig(model ? stringify(model.config) : "");
    setConfigSelects(
      model
        ? model.configSelects.reduce<ConfigSelectType>((acc, curr) => {
            acc[curr.name] = curr.values[0];
            return acc;
          }, {})
        : {}
    );
  }, [model]);
  useEffect(() => onClickResetConfig(), [onClickResetConfig]);

  return {
    useProvider: [provider, setProvider] as const,
    useModel: [model, setModel] as const,
    useConfig: [config, setConfig] as const,
    useConfigSelects: [configSelects, setConfigSelects] as const,
    onClickResetConfig,
    models,
  };
}
