"use client";

import { useCallback } from "react";
import Select from "../general/selects/Select";
import { Input } from "../ui";
import { Slider } from "../ui/slider";
import useModelStore from "@/store/model";
import ModelResetButton from "../buttons/ModelResetButton";

export default function Model() {
  const [model, config, setModelStore] = useModelStore((state) => [
    state.model,
    state.config,
    state.setModelStore,
  ]);
  const onChange = useCallback(
    (name: string) => (value: string) => {
      const newConfig = { ...config };
      newConfig[name] = value;
      setModelStore({ config: newConfig });
    },
    [config, setModelStore]
  );

  if (!model) return null;

  return (
    <div className="w-full">
      <div className="sticky top-0 md:top-14 pl-[6.75rem] md:pl-0 w-full pb-3 md:pb-0 md:h-0 z-20 bg-background">
        <ModelResetButton />
      </div>
      <div className="w-full flex flex-col gap-7 md:pl-[8.5rem] md:py-3 whitespace-pre-wrap text-sm">
        <div className="text-base font-bold text-theme-foreground bg-theme px-2 py-1 rounded-md">
          {model.name}
        </div>
        <div>
          <div className="font-bold">Price</div>
          <div className="text-neutral-400">
            {`$${model.inputPricePerMillion} / 1M input tokens, $${model.outputPricePerMillion} / 1M output tokens`}
          </div>
        </div>
        {model.configs.map((c) => (
          <div key={c.hashId} className="flex flex-col gap-1">
            <div className="flex gap-1 items-center">
              <div className="font-bold">{c.name}</div>
              <div className="text-neutral-500 text-xs">{`${c.type}, default: ${
                typeof c.default === "string" ? c.default : "null"
              }`}</div>
            </div>
            {c.options.length === 0 && !c.min && !c.max && (
              <Input
                placeholder={typeof c.default === "string" ? c.default : "null"}
                value={config[c.name] ?? c.default}
                onChange={(e) => onChange(c.name)(e.currentTarget.value)}
              />
            )}
            {typeof c.min === "number" && typeof c.max === "number" && (
              <div className="flex items-center gap-1">
                <div className="w-12">
                  {Number(config[c.name] ?? c.default).toFixed(
                    c.type === "integer" ? 0 : 2
                  )}
                </div>
                <Slider
                  min={c.min}
                  max={c.max}
                  step={c.type === "integer" ? 1 : 0.01}
                  value={[Number(config[c.name] ?? c.default)]}
                  onValueChange={(v) => onChange(c.name)(v[0].toString())}
                />
              </div>
            )}
            {c.options.length > 0 && (
              <Select
                options={c.options.map((o) => o.value)}
                useOption={[config[c.name] ?? c.default, onChange(c.name)]}
              />
            )}
            <div className="text-neutral-400">{c.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
