"use client";

import { RotateCcw } from "lucide-react";
import IconTextButton from "./IconTextButton";
import useModelStore, { ConfigType } from "@/store/model";
import { useCallback } from "react";

export default function ModelResetButton() {
  const [model, setModelStore] = useModelStore((state) => [
    state.model,
    state.setModelStore,
  ]);

  const onClickReset = useCallback(() => {
    if (!model) return;

    const newConfig: ConfigType = {};
    model.configs.forEach(({ config }) => {
      if (!config.default) {
        newConfig[config.name] = "";
      } else {
        newConfig[config.name] = config.default;
      }
    });

    setModelStore({ config: newConfig });
  }, [model, setModelStore]);

  return (
    <IconTextButton
      className="w-full md:w-28"
      Icon={RotateCcw}
      text="Reset"
      onClick={onClickReset}
      responsive
    />
  );
}
