"use client";

import List from "@/components/List";
import callApi from "@/utils/callApi";
import { HistoriesGetResponse } from "gpinterface-shared/type/history";
import { Fragment, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import MenuButton from "@/components/general/buttons/MenuButton";
import { MessageSquareCode, ReceiptText, SquareCode } from "lucide-react";
import { Badge } from "@/components/ui";
import History from "@/components/general/dialogs/History";

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
      if (response.histories.length === 0) {
        setSpinnerHidden(true);
      }
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
      <div className="w-full flex-1 grid grid-cols-[auto_auto_1fr] gap-3 items-center py-3 overflow-y-auto">
        {groupedTextHistories?.map(([date, history], index) => (
          <Fragment key={date}>
            {history.histories.map((h) => (
              <Fragment key={h.hashId}>
                <div className="pl-3">
                  <div className="h-6">
                    <History history={h}>
                      <MenuButton
                        className="w-28 h-6"
                        Icon={ReceiptText}
                        text="Show detail"
                      />
                    </History>
                  </div>
                  <div className="h-6 mt-3">
                    <Link
                      href={
                        h.apiHashId
                          ? `/apis/${h.apiHashId}`
                          : h.chatHashId
                          ? `/chats/${h.chatHashId}`
                          : "/#"
                      }
                    >
                      <MenuButton
                        Icon={h.apiHashId ? SquareCode : MessageSquareCode}
                        text={`Go to ${h.apiHashId ? "api" : "chat"}`}
                        className="w-28"
                      />
                    </Link>
                  </div>
                </div>
                <Badge variant="tag" className="self-start">
                  assistant
                </Badge>
                <div className="w-full truncate pr-3 self-start text-sm">
                  {h.content}
                </div>
                <div className="mx-3 col-span-3 border-b border-theme border-dashed"></div>
              </Fragment>
            ))}
            {(spinnerHidden || index < groupedTextHistories.length) && (
              <Fragment>
                <div className="font-bold text-lg w-28 pl-3">{date}</div>
                <div className="col-span-2 leading-7 pr-3">
                  ${history.priceSum.toFixed(5)}
                </div>
                <div className="col-span-3 border-b border-theme"></div>
              </Fragment>
            )}
          </Fragment>
        ))}
      </div>
    </List>
  );
}
