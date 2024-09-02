"use client";

import { useEffect, useState } from "react";
import callApi from "@/utils/callApi";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import useProviderTypes from "@/hooks/useProviderTypes";
import Gpi from "@/components/gpi/Gpi";
import GpiTestDialog, {
  TestDataType,
} from "@/components/dialogs/GpiTestDialog";

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

  const [testData, setTestData] = useState<TestDataType>();
  const [testOpen, setTestOpen] = useState(false);

  useProviderTypes();

  if (!gpi) return null;

  return (
    <div className="w-full flex-1 flex flex-col gap-3 pt-3 overflow-hidden">
      <div className="h-full w-full overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 p-3">
          <Gpi gpi={gpi} setTestData={setTestData} setTestOpen={setTestOpen} />
        </div>
      </div>
      <GpiTestDialog
        useTestData={[testData, setTestData]}
        useTestOpen={[testOpen, setTestOpen]}
      />
    </div>
  );
}
