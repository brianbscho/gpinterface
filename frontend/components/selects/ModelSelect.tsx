"use client";

import { Fragment, useCallback, useState } from "react";
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
import IconTextButton from "../buttons/IconTextButton";
import useModelStore from "@/store/model";

export default function ModelSelect() {
  const isLoggedOut = useUserStore((state) => state.isLoggedOut);
  const [modelHashId, providerTypes, setModelHashId] = useModelStore(
    (state) => [state.modelHashId, state.providerTypes, state.setModelHashId]
  );

  const onValueChange = useCallback(
    (modelHashId: string) => setModelHashId(modelHashId),
    [setModelHashId]
  );

  const [open, setOpen] = useState(false);

  return (
    <Select
      value={modelHashId}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectEmptyTrigger className="w-full md:w-auto h-6 sm:h-8">
        <IconTextButton
          className="w-full md:w-28"
          Icon={ChevronDown}
          text="Models"
          selected={open}
          responsive
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
                    ? " (api key required)"
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
