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
      setTextHistories((prev) => [...(prev ?? []), ...response.textHistories]);
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
      <table className="w-full">
        <thead>
          <tr>
            <td className="hidden md:table-cell">Model</td>
            <td className="w-2/5 md:w-auto">Input</td>
            <td className="w-2/5 md:w-auto">Answer</td>
            <td className="hidden md:table-cell">Price</td>
            <td className="w-1/5 md:w-auto">Details</td>
          </tr>
        </thead>
        <tbody className="w-full">
          {groupedTextHistories?.map(([date, history], index) => (
            <Fragment key={date}>
              {history.histories.map((t) => (
                <tr key={t.hashId} className="w-full">
                  <td className="text-nowrap hidden md:table-cell">
                    {t.model}
                  </td>
                  <td className="truncate">{stringify(t.input)}</td>
                  <td className="truncate">{t.content}</td>
                  <td className="text-nowrap hidden md:table-cell">
                    ${t.price}
                  </td>
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
