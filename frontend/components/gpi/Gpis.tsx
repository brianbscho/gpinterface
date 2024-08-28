"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState } from "react";
import { GpisGetResponse } from "gpinterface-shared/type/gpi";
import List from "../List";
import Gpi from "./Gpi";
import useProviderTypes from "@/hooks/useProviderTypes";

export default function Gpis() {
  const [gpis, setGpis] = useState<GpisGetResponse["gpis"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callGpisApi = useCallback(async () => {
    const response = await callApi<GpisGetResponse>({
      endpoint: `/gpis?lastHashId=${lastHashId}`,
    });
    if (response) {
      setGpis((prev) => [...(prev ?? []), ...response.gpis]);
      if (response.gpis.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  useProviderTypes();

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div className="h-full w-full overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 p-3">
          <List
            callApi={callGpisApi}
            emptyMessage="Start your chat!"
            elements={gpis}
            spinnerHidden={spinnerHidden}
            useLastHashId={[lastHashId, setLastHashId]}
          >
            {gpis?.map((gpi) => (
              <Gpi key={gpi.hashId} gpi={gpi} />
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}
