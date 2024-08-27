"use client";

import callApi from "@/utils/callApi";
import { useEffect } from "react";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/providerType";
import useModelStore from "@/store/model";

export default function useModels() {
  const [models, setModelStore] = useModelStore((state) => [
    state.models,
    state.setModelStore,
  ]);
  useEffect(() => {
    if (models.length > 0) return;

    const getProviderGetTypes = async () => {
      const response = await callApi<ProviderTypesGetResponse>({
        endpoint: "/provider/types",
        showError: true,
      });
      if (response) {
        const models = response.providerTypes
          .flatMap((type) => type.providers)
          .flatMap((provider) => provider.models);
        setModelStore({ models });
      }
    };
    getProviderGetTypes();
  }, [models, setModelStore]);
}
