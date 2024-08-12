"use client";

import { useMemo, useState } from "react";
import { ProviderType } from "gpinterface-shared/type/providerType";
import useUserStore from "@/store/user";
import useConfigStore from "@/store/config";
import SelectModel from "./SelectModel";
import Model from "./Model";

export default function Config() {
  const [providerTypes, setProviderTypes] = useState<ProviderType[]>();

  const { modelHashId } = useConfigStore();
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

  return (
    <div className="h-full px-3 pb-3 overflow-y-auto">
      <SelectModel useProviderTypes={[providerTypes, setProviderTypes]} />
      <Model providerTypes={providerTypes} />
    </div>
  );
}
