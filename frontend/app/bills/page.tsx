"use client";

import List from "@/components/List";
import callApi from "@/utils/callApi";
import { HistoriesGetResponse } from "gpinterface-shared/type/history";
import { Fragment, useCallback, useMemo, useState } from "react";
import IconTextButton from "@/components/buttons/IconTextButton";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui";
import HistoryDialog from "@/components/dialogs/HistoryDialog";

export default function Page() {
  const [histories, setHistories] = useState<HistoriesGetResponse>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callTextHistoriesGpi = useCallback(async () => {
    const response = await callApi<HistoriesGetResponse>({
      endpoint: `/histories?lastHashId=${lastHashId}`,
      redirectToMain: true,
    });
    if (response) {
      setHistories((prev) => [...(prev ?? []), ...response]);
      if (response.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);

  const groupedTextHistories = useMemo(() => {
    type HistoryWithPriceSum = {
      [date: string]: { priceSum: number; histories: HistoriesGetResponse };
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
      <div className="w-full h-full overflow-y-auto">
        <div className="grid grid-cols-4 gap-y-3 items-center">
          <div className="z-10 sticky top-0 self-start h-16 md:h-12 py-3 pl-3 bg-background font-bold border-b">
            Date
          </div>
          <div className="z-10 sticky top-0 self-start h-16 md:h-12 py-3 bg-background font-bold border-b">
            Model
          </div>
          <div className="z-10 sticky top-0 self-start h-16 md:h-12 py-3 bg-background font-bold border-b">
            Detail
          </div>
          <div className="z-10 sticky top-0 self-start h-16 md:h-12 py-3 bg-background font-bold border-b">
            Price
          </div>
          {groupedTextHistories?.map(([date, history], index) => (
            <Fragment key={date}>
              {history.histories.map((h) => (
                <Fragment key={h.hashId}>
                  <div></div>
                  <div className="pr-3">
                    <Badge variant="tag" className="w-full md:w-auto">
                      <div className="w-full truncate">{h.model}</div>
                    </Badge>
                  </div>
                  <div>
                    <HistoryDialog history={h}>
                      <IconTextButton
                        className="w-16 md:w-24"
                        Icon={Layers}
                        text="Detail"
                        responsive
                      />
                    </HistoryDialog>
                  </div>
                  <div
                    className={`text-sm${
                      h.paid === 0 ? " line-through text-neutral-700" : ""
                    }`}
                  >
                    ${h.price.toFixed(5)}
                  </div>
                  <div></div>
                  <div className="col-span-3 border-b border-dashed"></div>
                </Fragment>
              ))}
              <Fragment>
                <div className="col-span-3 font-bold text-lg w-28 pl-3">
                  {date}
                </div>
                <div className="leading-7 pr-3">
                  ${history.priceSum.toFixed(5)}
                </div>
                <div className="col-span-4 border-b border-theme"></div>
              </Fragment>
            </Fragment>
          ))}
        </div>
      </div>
    </List>
  );
}
