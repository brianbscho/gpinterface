"use client";

import callApi from "@/utils/callApi";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import {
  ProviderType,
  ProviderTypesGetResponse,
} from "gpinterface-shared/type/providerType";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui";
import useUserStore from "@/store/user";
import useContentStore from "@/store/content";

export default function SelectModel({
  useProviderTypes,
}: {
  useProviderTypes: [
    ProviderType[] | undefined,
    (p: ProviderType[] | undefined) => void
  ];
}) {
  const [providerTypes, setProviderTypes] = useProviderTypes;
  useEffect(() => {
    const getProviderGetTypes = async () => {
      const response = await callApi<ProviderTypesGetResponse>({
        endpoint: "/provider/types",
      });
      setProviderTypes(response?.providerTypes);
    };
    getProviderGetTypes();
  }, [setProviderTypes]);

  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const [model, setContentStore] = useContentStore((state) => [
    state.model,
    state.setContentStore,
  ]);

  const models = useMemo(() => {
    if (!providerTypes) return [];

    return providerTypes
      .flatMap((type) => type.providers)
      .flatMap((provider) => provider.models);
  }, [providerTypes]);
  useEffect(() => {
    if (models.length === 0) return;
    if (isLoggedOut) {
      const index = models.findIndex(
        (m) => m.isAvailable && m.isFree && !m.isLoginRequired
      );
      setContentStore({ model: models[index] });
    } else {
      const index = models.findIndex((m) => m.isAvailable && m.isFree);
      setContentStore({ model: models[index] });
    }
  }, [isLoggedOut, models, setContentStore]);
  const onValueChange = useCallback(
    (modelHashId: string) => {
      const _model = models.find((m) => m.hashId === modelHashId);
      if (_model) {
        setContentStore({ model: _model });
      }
    },
    [models, setContentStore]
  );

  if (!providerTypes) return null;

  return (
    <div className="sticky top-0 py-3 bg-muted z-10">
      <Select value={model?.hashId} onValueChange={onValueChange}>
        <SelectTrigger className="w-80">
          <SelectValue placeholder="Please select model"></SelectValue>
        </SelectTrigger>
        <SelectContent>
          {providerTypes.map((type) => (
            <SelectGroup key={type.hashId}>
              <SelectLabel className="bg-muted text-muted-foreground">
                {type.type}
              </SelectLabel>
              {type.providers.map((provider) => (
                <Fragment key={provider.hashId}>
                  <SelectLabel className="bg-muted text-muted-foreground font-normal">
                    {provider.name}
                  </SelectLabel>
                  {provider.models.map((model) => {
                    const { isLoginRequired, isAvailable, isFree } = model;
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
                        key={model.hashId}
                        value={model.hashId}
                        disabled={loginRequired || !isAvailable || !isFree}
                      >
                        {`${model.name}${disableMessage}`}
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
