"use client";

import { useMemo } from "react";
import { ProviderType } from "gpinterface-shared/type/providerType";
import useConfigStore from "@/store/config";

export default function Model({
  providerTypes,
}: {
  providerTypes: ProviderType[] | undefined;
}) {
  const modelHashId = useConfigStore((state) => state.modelHashId);
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

  if (!model) return null;

  return (
    <div className="flex flex-col gap-3 max-w-80 whitespace-pre-line">
      <div>
        <div className="font-bold">Price</div>
        <div className="text-muted-foreground text-sm">
          {`$${model.inputPricePerMillion} / 1M input tokens, $${model.outputPricePerMillion} / 1M output tokens`}
        </div>
      </div>
      {model.configs.map((c) => (
        <div key={c.hashId}>
          <div className="font-bold">{c.name}</div>
          <div className="text-muted-foreground text-sm">{c.description}</div>
        </div>
      ))}
    </div>
  );
}
