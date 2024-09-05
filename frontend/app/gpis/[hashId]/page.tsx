"use client";

import { useEffect, useState } from "react";
import callApi from "@/utils/callApi";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import useProviderTypes from "@/hooks/useProviderTypes";
import Gpi from "@/components/gpi/Gpi";

export default function Page({ params }: { params: { hashId: string } }) {
  const { hashId } = params;
  const [gpi, setGpi] = useState<GpiGetResponse>();
  useEffect(() => {
    const callApiApi = async () => {
      const response = await callApi<GpiGetResponse>({
        endpoint: `/gpi/${hashId}`,
        showError: true,
        redirectToMain: true,
      });
      setGpi(response);
    };
    callApiApi();
  }, [hashId]);

  useProviderTypes();

  if (!gpi) return null;
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-3 p-3">
        <Gpi gpi={gpi} />
      </div>
    </div>
  );
}
