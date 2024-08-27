"use client";

import callApi from "@/utils/callApi";
import { useEffect } from "react";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/providerType";
import useModelStore from "@/store/model";

export default function useModels() {
  const [providerTypes, setProviderTypes] = useModelStore((state) => [
    state.providerTypes,
    state.setProviderTypes,
  ]);
  useEffect(() => {
    if (providerTypes.length > 0) return;

    const getProviderGetTypes = async () => {
      const response = await callApi<ProviderTypesGetResponse>({
        endpoint: "/provider/types",
        showError: true,
      });
      setProviderTypes(response?.providerTypes ?? []);
    };
    getProviderGetTypes();
  }, [providerTypes, setProviderTypes]);
}
