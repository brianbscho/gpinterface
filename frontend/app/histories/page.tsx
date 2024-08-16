"use client";

import List from "@/components/List";
import callApi from "@/utils/callApi";
import { HistoriesGetResponse } from "gpinterface-shared/type/history";
import { Fragment, useCallback, useMemo, useState } from "react";
import History from "./History";
import { Badge } from "@/components/ui";
import Link from "next/link";

type HistoriesType = HistoriesGetResponse["histories"];
export default function Page() {
  const [histories, setHistories] = useState<HistoriesType>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callTextHistoriesApi = useCallback(async () => {
    const response = await callApi<HistoriesGetResponse>({
      endpoint: `/histories?lastHashId=${lastHashId}`,
      showError: true,
    });
    if (response) {
      setHistories((prev) => [...(prev ?? []), ...response.histories]);
    }
    if (response?.histories.length === 0) {
      setSpinnerHidden(true);
    }
  }, [lastHashId]);

  const groupedTextHistories = useMemo(() => {
    type HistoryWithPriceSum = {
      [date: string]: { priceSum: number; histories: HistoriesType };
    };
    const grouped = histories?.reduce((acc: HistoryWithPriceSum, curr) => {
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
  }, [histories]);

  return (
    <List
      callApi={callTextHistoriesApi}
      emptyMessage="No history of usage yet"
      elements={histories}
      spinnerHidden={spinnerHidden}
      useLastHashId={[lastHashId, setLastHashId]}
    >
      <div className="w-full grid grid-cols-[auto_1fr_auto] gap-3 items-center py-3 overflow-y-auto">
        {groupedTextHistories?.map(([date, history], index) => (
          <Fragment key={date}>
            {history.histories.map((h) => (
              <Fragment key={h.hashId}>
                <div className="w-28 pl-3">
                  <History history={h} />
                </div>
                <Link
                  href={
                    h.apiHashId
                      ? `/apis/${h.apiHashId}`
                      : h.chatHashId
                      ? `/chats/${h.chatHashId}`
                      : "/#"
                  }
                >
                  <Badge>{h.isApi ? "API" : "Chat"}</Badge>
                </Link>
                <div className="truncate pr-3">{h.content}</div>
              </Fragment>
            ))}
            {(spinnerHidden || index < groupedTextHistories.length) && (
              <Fragment>
                <div className="w-28 text-muted-foreground pl-3">Date</div>
                <div className="col-span-2 text-muted-foreground pr-3">
                  Price
                </div>
                <div className="font-bold text-lg w-28 pl-3">{date}</div>
                <div className="col-span-2 leading-7 pr-3">
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
