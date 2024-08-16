"use client";

import { useCallback, useMemo } from "react";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/providerType";
import useContentStore, { ConfigType } from "@/store/content";
import Select from "../general/selects/Select";
import { Button, Card, CardContent, Input } from "../ui";
import { Slider } from "../ui/slider";
import { RotateCcw } from "lucide-react";
import Collapsible from "../general/collapsible";
import { stringify } from "@/utils/string";
import { getApiConfig } from "@/utils/model";

export default function Model({
  providerTypes,
}: {
  providerTypes: ProviderTypesGetResponse["providerTypes"] | undefined;
}) {
  const [{ modelHashId, config }, setContentStore] = useContentStore(
    (state) => [
      { modelHashId: state.model?.hashId, config: state.config },
      state.setContentStore,
    ]
  );
  const model = useMemo(() => {
    if (!providerTypes) return undefined;

    for (let i = 0; i < providerTypes.length; i++) {
      const { providers } = providerTypes[i];
      for (let j = 0; j < providers.length; j++) {
        const { models } = providers[j];
        for (let k = 0; k < models.length; k++) {
          if (modelHashId === models[k].hashId) {
            return models[k];
          }
        }
      }

      return undefined;
    }
  }, [providerTypes, modelHashId]);
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
    <div className="flex flex-col gap-3 whitespace-pre-wrap">
      <div>
        <div className="font-bold">Price</div>
        <div className="text-muted-foreground text-sm">
          {`$${model.inputPricePerMillion} / 1M input tokens, $${model.outputPricePerMillion} / 1M output tokens`}
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Collapsible title="Config Preview">
            <Card>
              <CardContent className="p-3 w-72">
                <div className="whitespace-pre-wrap text-xs">
                  {stringify(getApiConfig(model, config))}
                </div>
              </CardContent>
            </Card>
          </Collapsible>
        </div>
        <Button
          variant="default"
          className="h-6 w-6 p-1"
          onClick={onClickReset}
        >
          <RotateCcw />
        </Button>
      </div>
      {model.configs.map((c) => (
        <div key={c.hashId} className="flex flex-col gap-1">
          <div className="flex gap-1 items-center">
            <div className="font-bold">{c.name}</div>
            <div className="text-gray-300 text-xs">{c.type}</div>
            <div className="text-gray-300 text-xs">{`, default: ${
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
          <div className="text-muted-foreground text-sm">{c.description}</div>
        </div>
      ))}
    </div>
  );
}
