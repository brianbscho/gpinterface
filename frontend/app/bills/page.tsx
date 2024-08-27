"use client";

import List from "@/components/List";
import callApi from "@/utils/callApi";
import { HistoriesGetResponse } from "gpinterface-shared/type/history";
import { Fragment, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import IconTextButton from "@/components/buttons/IconTextButton";
import { FileClock, MessageSquareCode, SquareCode } from "lucide-react";
import { Badge } from "@/components/ui";
import HistoryDialog from "@/components/dialogs/HistoryDialog";

type HistoriesType = HistoriesGetResponse["histories"];
export default function Page() {
  const [histories, setHistories] = useState<HistoriesType>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callTextHistoriesGpi = useCallback(async () => {
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
      acc[date].priceSum += curr.paid;

      return acc;
    }, {});

    if (!grouped) return undefined;
    return Object.entries(grouped);
  }, [histories]);

  return (
    <List
      callApi={callTextHistoriesGpi}
      emptyMessage="No history of usage yet"
      elements={histories}
      spinnerHidden={spinnerHidden}
      useLastHashId={[lastHashId, setLastHashId]}
    >
      <div className="w-full flex-1  overflow-y-auto">
        <div className="grid grid-cols-5 gap-y-3 items-center">
          <div className="z-10 sticky top-0 self-start h-16 md:h-12 py-3 pl-3 bg-background font-bold">
            Date
          </div>
          <div className="z-10 sticky top-0 self-start h-16 md:h-12 py-3 bg-background font-bold">
            Model
          </div>
          <div className="z-10 sticky top-0 self-start h-16 md:h-12 py-3 bg-background font-bold">
            Input tokens
          </div>
          <div className="z-10 sticky top-0 self-start h-16 md:h-12 py-3 bg-background font-bold">
            Output tokens
          </div>
          <div className="z-10 sticky top-0 self-start h-16 md:h-12 py-3 bg-background font-bold">
            Price
          </div>
          {groupedTextHistories?.map(([date, history], index) => (
            <Fragment key={date}>
              {history.histories.map((h) => (
                <Fragment key={h.hashId}>
                  <div></div>
                  <div className="flex flex-wrap flex-col gap-3 pr-3">
                    <Badge
                      variant="tag"
                      className="self-start w-full md:w-auto"
                    >
                      <div className="w-full truncate">{h.model}</div>
                    </Badge>
                    <HistoryDialog history={h}>
                      <IconTextButton
                        className="w-16 md:w-24"
                        Icon={FileClock}
                        text="Detail"
                        responsive
                      />
                    </HistoryDialog>
                    <div>
                      <Link
                        href={
                          h.gpiHashId
                            ? `/gpis/${h.gpiHashId}`
                            : h.chatHashId
                            ? `/chats/${h.chatHashId}`
                            : "/#"
                        }
                      >
                        <IconTextButton
                          Icon={h.gpiHashId ? SquareCode : MessageSquareCode}
                          text={h.gpiHashId ? "Gpi" : "Chat"}
                          className="w-16 md:w-24"
                          responsive
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="self-start text-sm">{h.inputTokens}</div>
                  <div className="self-start text-sm">{h.outputTokens}</div>
                  <div
                    className={`self-start text-sm${
                      h.paid === 0 ? " line-through" : ""
                    }`}
                  >
                    ${h.price.toFixed(5)}
                  </div>
                  <div className="col-span-2"></div>
                  <div className="col-span-3 border-b border-theme border-dashed"></div>
                </Fragment>
              ))}
              {(spinnerHidden || index < groupedTextHistories.length) && (
                <Fragment>
                  <div className="col-span-4 font-bold text-lg w-28 pl-3">
                    {date}
                  </div>
                  <div className="leading-7 pr-3">
                    ${history.priceSum.toFixed(5)}
                  </div>
                  <div className="col-span-5 border-b border-theme"></div>
                </Fragment>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </List>
  );
}
