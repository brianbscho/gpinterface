"use client";

import TextUsage from "@/components/general/dialogs/TextUsage";
import List from "@/components/List";
import callApi from "@/util/callApi";
import { stringify } from "@/util/string";
import { TextPromptHistory } from "gpinterface-shared/type";
import { TextHistoriesGetResponse } from "gpinterface-shared/type/textHistory";
import { Fragment, useCallback, useMemo, useState } from "react";

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

  const groupedTextHistories = useMemo(() => {
    type HistoryWithPriceSum = {
      [date: string]: { priceSum: number; histories: TextPromptHistory[] };
    };
    const grouped = textHistories?.reduce((acc: HistoryWithPriceSum, curr) => {
      const date = curr.createdAt.split(" ")[0];
      if (!acc[date]) {
        acc[date] = { priceSum: 0, histories: [] };
      }

      acc[date].histories.push(curr);
      acc[date].priceSum += curr.price;

      return acc;
    }, {});

    if (!grouped) return undefined;
    return Object.entries(grouped);
  }, [textHistories]);

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
          {groupedTextHistories?.map(([date, history], index) => (
            <Fragment key={date}>
              {history.histories.map((t) => (
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
              {(spinnerHidden || index < groupedTextHistories.length) && (
                <tr>
                  <td className="font-bold text-lg">{date}</td>
                  <td colSpan={4}>daily usage sum: ${history.priceSum}</td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </List>
  );
}
