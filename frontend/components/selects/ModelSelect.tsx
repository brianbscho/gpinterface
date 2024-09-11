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
  const [isLoggedOut, balance] = useUserStore((state) => [
    !state.user,
    state.user?.balance,
  ]);
  const [modelHashId, models, providerTypes, setModelHashId] = useModelStore(
    (state) => [
      state.modelHashId,
      state.models,
      state.providerTypes,
      state.setModelHashId,
    ]
  );

  const onValueChange = useCallback(
    (modelHashId: string) => {
      const model = models.find((m) => m.hashId === modelHashId);
      if (model) {
        setModelHashId(model.hashId);
      }
    },
    [models, setModelHashId]
  );

  const [open, setOpen] = useState(false);

  return (
    <Select
      value={modelHashId}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectEmptyTrigger asChild>
        <div className="flex">
          <IconTextButton Icon={ChevronDown} text="Models" responsive />
        </div>
      </SelectEmptyTrigger>
      <SelectContent className="w-[23rem]">
        {providerTypes.map((type) => (
          <SelectGroup key={type.hashId}>
            {type.providers.map((provider) => (
              <Fragment key={provider.hashId}>
                <SelectLabel>{provider.name}</SelectLabel>
                {provider.models.map((m) => {
                  const { isLoginRequired, isFree } = m;
                  const loginRequired = isLoggedOut && isLoginRequired;
                  const paymentRequired = !isFree && !balance;
                  const disableMessage = loginRequired
                    ? " (login required)"
                    : paymentRequired
                    ? " (payment required)"
                    : "";

                  return (
                    <SelectItem
                      key={m.hashId}
                      value={m.hashId}
                      disabled={loginRequired || paymentRequired}
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
