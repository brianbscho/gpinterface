"use client";

import { stringify } from "@/util/string";
import { textModels } from "gpinterface-shared/models/text/model";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function useTextModel() {
  const [provider, setProvider] = useState(textModels[0].provider);
  const [model, setModel] = useState("");
  const [config, setConfig] = useState("{}");

  const aiIndex = useMemo(() => {
    const index = textModels.findIndex((m) => m.provider === provider);
    return index > -1 ? index : 0;
  }, [provider]);
  const models = useMemo(() => textModels[aiIndex].models, [aiIndex]);

  useEffect(() => setModel(models[0]), [models]);

  const onClickResetConfig = useCallback(
    () => setConfig(stringify(textModels[aiIndex].config)),
    [aiIndex]
  );
  useEffect(() => onClickResetConfig(), [onClickResetConfig]);

  return {
    useProvider: [provider, setProvider] as const,
    useModel: [model, setModel] as const,
    useConfig: [config, setConfig] as const,
    onClickResetConfig,
    models,
  };
}
