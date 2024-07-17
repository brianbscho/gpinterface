"use client";

import TextUsage from "@/components/general/dialogs/TextUsage";
import List from "@/components/List";
import callApi from "@/util/callApi";
import { stringify } from "@/util/string";
import { TextPromptHistory } from "gpinterface-shared/type";
import { TextHistoriesGetResponse } from "gpinterface-shared/type/textHistory";
import { useCallback, useState } from "react";

export default function TextUsages() {
  const [textHistories, setTextHistories] = useState<TextPromptHistory[]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callTextHistoriesApi = useCallback(async () => {
    const response = await callApi<TextHistoriesGetResponse>({
      endpoint: `/text/histories?lastHashId=${lastHashId}`,
    });
    if (response) {
      setTextHistories((prev) => [
        ...(prev ? prev : []),
        ...response.textHistories,
      ]);
    }
    if (response?.textHistories.length === 0) {
      setSpinnerHidden(true);
    }
  }, [lastHashId]);

  return (
    <List
      callApi={callTextHistoriesApi}
      emptyMessage="No usage yet"
      elements={textHistories}
      spinnerHidden={spinnerHidden}
      useLastHashId={[lastHashId, setLastHashId]}
    >
      <table className="border-spacing-3 border-separate w-full table-fixed">
        <thead>
          <tr>
            <td>Model</td>
            <td>Input</td>
            <td>Answer</td>
            <td>Price</td>
            <td>Details</td>
          </tr>
        </thead>
        <tbody className="w-full">
          {textHistories?.map((t) => (
            <tr key={t.hashId} className="w-full">
              <td className="text-nowrap">{t.model}</td>
              <td className="truncate w-full">{stringify(t.input)}</td>
              <td className="truncate w-full">{t.content}</td>
              <td className="text-nowrap">${t.price}</td>
              <td className="text-nowrap">
                <TextUsage textHistory={t} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </List>
  );
}
