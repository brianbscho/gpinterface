"use client";

import callApi from "@/utils/callApi";
import { useCallback, useState } from "react";
import List from "@/components/List";
import { ApisGetResponse } from "gpinterface-shared/type/api";
import Api from "./Api";

export default function Apis() {
  const [apis, setApis] = useState<ApisGetResponse["apis"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callApisApi = useCallback(async () => {
    const response = await callApi<ApisGetResponse>({
      endpoint: `/apis?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      setApis((prev) => [...(prev ?? []), ...response.apis]);
      if (response.apis.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  return (
    <div className="w-full">
      <List
        callApi={callApisApi}
        emptyMessage="No Apis yet"
        elements={apis}
        spinnerHidden={spinnerHidden}
        useLastHashId={[lastHashId, setLastHashId]}
      >
        {apis?.map((api) => (
          <Api key={api.hashId} api={api} />
        ))}
      </List>
    </div>
  );
}
