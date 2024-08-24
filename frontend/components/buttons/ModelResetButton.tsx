"use client";

import { RotateCcw } from "lucide-react";
import MenuButton from "./MenuButton";
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
    model.configs.forEach((c) => {
      if (!c.default) {
        newConfig[c.name] = "";
      } else {
        newConfig[c.name] = c.default;
      }
    });

    setModelStore({ config: newConfig });
  }, [model, setModelStore]);

  return (
    <MenuButton
      className="w-24 md:w-28"
      Icon={RotateCcw}
      text="Reset"
      onClick={onClickReset}
      responsive
    />
  );
}
