"use client";

import callApi from "@/utils/callApi";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/providerType";
import {
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "../ui";
import useUserStore from "@/store/user";
import useContentStore from "@/store/content";
import { ChevronDown } from "lucide-react";

export default function SelectModel() {
  const [providerTypes, setProviderTypes] =
    useState<ProviderTypesGetResponse["providerTypes"]>();
  useEffect(() => {
    const getProviderGetTypes = async () => {
      const response = await callApi<ProviderTypesGetResponse>({
        endpoint: "/provider/types",
        showError: true,
      });
      setProviderTypes(response?.providerTypes);
    };
    getProviderGetTypes();
  }, [setProviderTypes]);

  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const [modelHashId, setContentStore] = useContentStore((state) => [
    state.modelHashId,
    state.setContentStore,
  ]);

  const models = useMemo(() => {
    if (!providerTypes) return [];

    return providerTypes
      .flatMap((type) => type.providers)
      .flatMap((provider) => provider.models);
  }, [providerTypes]);
  useEffect(() => {
    setContentStore({ models });
  }, [setContentStore, models]);
  useEffect(() => {
    if (modelHashId) return;

    const index = models.findIndex(
      (m) => m.isAvailable && m.isFree && (!isLoggedOut || !m.isLoginRequired)
    );
    setContentStore({ modelHashId: models[index]?.hashId });
  }, [isLoggedOut, models, modelHashId, setContentStore]);
  const onValueChange = useCallback(
    (modelHashId: string) => {
      const _model = models.find((m) => m.hashId === modelHashId);
      setContentStore({ modelHashId: _model?.hashId });
    },
    [models, setContentStore]
  );

  if (!providerTypes) return null;

  return (
    <div className="sticky top-0 z-10 w-full">
      <Select value={modelHashId} onValueChange={onValueChange}>
        <SelectTrigger className="h-6 w-6 p-0 bg-primary">
          <Button className="h-6 w-6 p-1">
            <ChevronDown />
          </Button>
        </SelectTrigger>
        <SelectContent className="w-[23rem]">
          {providerTypes.map((type) => (
            <SelectGroup key={type.hashId}>
              {type.providers.map((provider) => (
                <Fragment key={provider.hashId}>
                  <SelectLabel>{provider.name}</SelectLabel>
                  {provider.models.map((m) => {
                    const { isLoginRequired, isAvailable, isFree } = m;
                    const loginRequired = isLoggedOut && isLoginRequired;
                    const disableMessage = loginRequired
                      ? " (login required)"
                      : !isFree
                      ? " (payment required)"
                      : !isAvailable
                      ? " (not available)"
                      : "";

                    return (
                      <SelectItem
                        key={m.hashId}
                        value={m.hashId}
                        disabled={loginRequired || !isAvailable || !isFree}
                      >
                        {`${m.name}${disableMessage}`}
                      </SelectItem>
                    );
                  })}
                </Fragment>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
