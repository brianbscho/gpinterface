"use client";

import callApi from "@/utils/callApi";
import { useEffect } from "react";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/provider-type";
import useModelStore from "@/store/model";

export default function useProviderTypes() {
  const [providerTypes, setProviderTypes, setModelHashId] = useModelStore(
    (state) => [
      state.providerTypes,
      state.setProviderTypes,
      state.setModelHashId,
    ]
  );
  useEffect(() => {
    if (providerTypes.length > 0) return;

    const getProviderGetTypes = async () => {
      const response = await callApi<ProviderTypesGetResponse>({
        endpoint: "/provider/types",
        showError: true,
      });
      if (response) {
        setProviderTypes(response);

        const models = response
          .flatMap((type) => type.providers)
          .flatMap((provider) => provider.models);
        const index = models.findIndex(
          (m) => m.isAvailable && m.isFree && !m.isLoginRequired
        );

        if (models[index]) {
          setModelHashId(models[index].hashId);
        }
      }
    };
    getProviderGetTypes();
  }, [providerTypes, setProviderTypes, setModelHashId]);
}
