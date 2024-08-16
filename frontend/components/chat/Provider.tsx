"use client";

import { useState } from "react";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/providerType";
import SelectModel from "./SelectModel";
import Model from "./Model";

export default function Config() {
  const [providerTypes, setProviderTypes] =
    useState<ProviderTypesGetResponse["providerTypes"]>();

  return (
    <div className="h-full px-3 pb-3 overflow-y-auto bg-muted w-96">
      <SelectModel useProviderTypes={[providerTypes, setProviderTypes]} />
      <Model providerTypes={providerTypes} />
    </div>
  );
}
