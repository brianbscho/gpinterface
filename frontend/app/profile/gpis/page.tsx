"use client";

import Gpi from "@/components/gpi/Gpi";
import GpiDraft from "@/components/gpi/GpiDraft";
import List from "@/components/List";
import useProviderTypes from "@/hooks/useProviderTypes";
import callApi from "@/utils/callApi";
import { GpisGetResponse } from "gpinterface-shared/type/gpi";
import { useCallback, useState } from "react";

export default function Page() {
  const [gpis, setGpis] = useState<GpisGetResponse>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callGpisApi = useCallback(async () => {
    const response = await callApi<GpisGetResponse>({
      endpoint: `/users/gpis?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      setGpis((prev) => [...(prev ?? []), ...response]);
      if (response.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  useProviderTypes();

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-3 p-3">
        <List
          callApi={callGpisApi}
          emptyMessage={"Start your chat!"}
          elements={gpis}
          spinnerHidden={spinnerHidden}
          useLastHashId={[lastHashId, setLastHashId]}
        >
          {gpis?.map((gpi) => {
            if (gpi.isDeployed) {
              return <Gpi key={gpi.hashId} gpi={gpi} />;
            }
            return <GpiDraft key={gpi.hashId} gpi={gpi} />;
          })}
        </List>
      </div>
    </div>
  );
}
