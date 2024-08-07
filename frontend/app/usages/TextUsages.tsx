"use client";

import TextUsage from "@/components/general/dialogs/TextUsage";
import List from "@/components/List";
import callApi from "@/utils/callApi";
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
      <div className="w-full grid grid-cols-[auto_1fr_auto] gap-3 items-center">
        {groupedTextHistories?.map(([date, history], index) => (
          <Fragment key={date}>
            {history.histories.map((t) => (
              <Fragment key={t.hashId}>
                <div className="w-28">
                  <TextUsage textHistory={t} />
                </div>
                <div className="truncate col-span-2">{t.content}</div>
              </Fragment>
            ))}
            {(spinnerHidden || index < groupedTextHistories.length) && (
              <Fragment>
                <div className="w-28 text-muted-foreground">Date</div>
                <div className="col-span-2 text-muted-foreground">Price</div>
                <div className="font-bold text-lg w-28">{date}</div>
                <div className="col-span-2 leading-7">
                  ${history.priceSum.toFixed(5)}
                </div>
                <div className="col-span-3 border-b"></div>
              </Fragment>
            )}
          </Fragment>
        ))}
      </div>
    </List>
  );
}
