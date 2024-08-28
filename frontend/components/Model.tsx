"use client";

import { useCallback, useEffect } from "react";
import Select from "./selects";
import { Input } from "./ui";
import { Slider } from "./ui/slider";
import useModelStore from "@/store/model";
import { cn } from "@/utils/css";
import useProviderTypes from "@/hooks/useProviderTypes";

type Props = { className?: string; disabled?: boolean; modelHashId?: string };
export default function Model({ className, disabled, modelHashId }: Props) {
  const [model, models, config, setModelHashId, setConfig] = useModelStore(
    (state) => [
      state.model,
      state.models,
      state.config,
      state.setModelHashId,
      state.setConfig,
    ]
  );

  useEffect(() => {
    if (modelHashId) {
      setModelHashId(modelHashId);
    }
  }, [modelHashId, setModelHashId, model, models]);
  const onChange = useCallback(
    (name: string) => (value: string) => {
      const newConfig = { ...config };
      newConfig[name] = value;
      setConfig(newConfig);
    },
    [config, setConfig]
  );
  useProviderTypes();

  if (!model) return null;

  return (
    <div
      className={cn(
        "w-full flex flex-col gap-7 md:pl-[8.5rem] whitespace-pre-wrap text-sm",
        className
      )}
    >
      <div className="text-base font-bold text-theme-foreground bg-theme px-2 py-1 rounded-md">
        {model.name}
      </div>
      <div>
        <div className="font-bold">Price</div>
        <div className="text-neutral-400">
          {`$${model.inputPricePerMillion} / 1M input tokens, $${model.outputPricePerMillion} / 1M output tokens`}
        </div>
      </div>
      {model.configs.map(({ config: c }) => (
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
              type={
                c.type === "number" || c.type === "integer"
                  ? "number"
                  : undefined
              }
              disabled={disabled}
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
                disabled={disabled}
              />
            </div>
          )}
          {c.options.length > 0 && (
            <Select
              options={c.options.map((o) => o.value)}
              useOption={[config[c.name] ?? c.default, onChange(c.name)]}
              disabled={disabled}
            />
          )}
          <div className="text-neutral-400">{c.description}</div>
        </div>
      ))}
    </div>
  );
}
