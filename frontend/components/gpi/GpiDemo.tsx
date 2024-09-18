"use client";

import callApi from "@/utils/callApi";
import { useEffect, useState } from "react";
import { GpiGetResponse, GpisGetResponse } from "gpinterface-shared/type/gpi";
import Gpi from "./Gpi";
import useProviderTypes from "@/hooks/useProviderTypes";

export default function GpiDemo() {
  const [gpi, setGpi] = useState<GpiGetResponse>();

  useEffect(() => {
    const callGpi = async () => {
      const response = await callApi<GpisGetResponse>({
        endpoint: `/gpis?keyword=`,
        showError: true,
      });
      if (response) {
        setGpi(response[0]);
      }
    };
    callGpi();
  }, []);

  useProviderTypes();

  if (!gpi) return null;
  return <Gpi gpi={gpi} />;
}
