"use client";

import callApi from "@/utils/callApi";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/providerType";
import {
  Select,
  SelectContent,
  SelectEmptyTrigger,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "../ui";
import useUserStore from "@/store/user";
import { ChevronDown } from "lucide-react";
import MenuButton from "../general/buttons/MenuButton";
import useModelStore from "@/store/model";

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
  const [modelHashId, setModelStore] = useModelStore((state) => [
    state.modelHashId,
    state.setModelStore,
  ]);

  const models = useMemo(() => {
    if (!providerTypes) return [];

    return providerTypes
      .flatMap((type) => type.providers)
      .flatMap((provider) => provider.models);
  }, [providerTypes]);
  useEffect(() => {
    setModelStore({ models });
  }, [setModelStore, models]);
  useEffect(() => {
    if (modelHashId) return;

    const index = models.findIndex(
      (m) => m.isAvailable && m.isFree && (!isLoggedOut || !m.isLoginRequired)
    );
    setModelStore({ modelHashId: models[index]?.hashId });
  }, [isLoggedOut, models, modelHashId, setModelStore]);
  const onValueChange = useCallback(
    (modelHashId: string) => {
      const _model = models.find((m) => m.hashId === modelHashId);
      setModelStore({ modelHashId: _model?.hashId });
    },
    [models, setModelStore]
  );

  const [open, setOpen] = useState(false);

  if (!providerTypes) return null;

  return (
    <Select
      value={modelHashId}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectEmptyTrigger className="h-8">
        <MenuButton
          className="w-28"
          Icon={ChevronDown}
          text="Models"
          onClick={() => setOpen(true)}
          selected={open}
        />
      </SelectEmptyTrigger>
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
  );
}
