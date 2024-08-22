"use client";

import { useCallback } from "react";
import useContentStore, { ConfigType } from "@/store/content";
import Select from "../general/selects/Select";
import { Input } from "../ui";
import { Slider } from "../ui/slider";
import { RotateCcw } from "lucide-react";
import MenuButton from "../general/buttons/MenuButton";

export default function Model() {
  const [{ model, config }, setContentStore] = useContentStore((state) => [
    { model: state.model, config: state.config },
    state.setContentStore,
  ]);
  const onChange = useCallback(
    (name: string) => (value: string) => {
      const newConfig = { ...config };
      newConfig[name] = value;
      setContentStore({ config: newConfig });
    },
    [config, setContentStore]
  );
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

    setContentStore({ config: newConfig });
  }, [model, setContentStore]);

  if (!model) return null;

  return (
    <div>
      <div className="sticky top-12 ml-3 w-full h-0 z-20 bg-background bg-background">
        <MenuButton
          className="w-24"
          Icon={RotateCcw}
          text="Reset"
          onClick={onClickReset}
        />
      </div>
      <div className="flex flex-col gap-7 pl-[7.5rem] py-3 whitespace-pre-wrap text-sm">
        <div className="font-bold text-yellow-300">{model.name}</div>
        <div>
          <div className="font-bold">Price</div>
          <div className="text-neutral-500">
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
            <div className="text-neutral-500 text-sm">{c.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
