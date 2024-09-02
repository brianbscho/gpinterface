"use client";

import callApi from "@/utils/callApi";
import { useCallback, useEffect, useState } from "react";
import { GpisGetResponse } from "gpinterface-shared/type/gpi";
import List from "../List";
import Gpi from "./Gpi";
import useProviderTypes from "@/hooks/useProviderTypes";
import GpiTestDialog, { TestDataType } from "../dialogs/GpiTestDialog";

type GpisProps = { baseUrl: string; emptyMessage?: string };
export default function Gpis({ baseUrl, emptyMessage }: GpisProps) {
  const [gpis, setGpis] = useState<GpisGetResponse["gpis"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  useEffect(() => {
    setGpis([]);
    setLastHashId("");
    setSpinnerHidden(false);
  }, [baseUrl]);

  const callGpisApi = useCallback(async () => {
    const response = await callApi<GpisGetResponse>({
      endpoint: `${baseUrl}&lastHashId=${lastHashId}`,
    });
    if (response) {
      setGpis((prev) => [...(prev ?? []), ...response.gpis]);
      if (response.gpis.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [baseUrl, lastHashId]);

  useProviderTypes();

  const [testData, setTestData] = useState<TestDataType>();
  const [testOpen, setTestOpen] = useState(false);

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div className="h-full w-full overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 p-3">
          <List
            callApi={callGpisApi}
            emptyMessage={emptyMessage ?? "Start your chat!"}
            elements={gpis}
            spinnerHidden={spinnerHidden}
            useLastHashId={[lastHashId, setLastHashId]}
          >
            {gpis?.map((gpi) => (
              <Gpi
                key={gpi.hashId}
                gpi={gpi}
                setTestData={setTestData}
                setTestOpen={setTestOpen}
              />
            ))}
          </List>
        </div>
      </div>
      <GpiTestDialog
        useTestData={[testData, setTestData]}
        useTestOpen={[testOpen, setTestOpen]}
      />
    </div>
  );
}
