"use client";

import ImageUsage from "@/components/general/dialogs/ImageUsage";
import List from "@/components/List";
import callApi from "@/util/callApi";
import { ImagePromptHistory } from "gpinterface-shared/type";
import { ImageHistoriesGetResponse } from "gpinterface-shared/type/imageHistory";
import { Fragment, useCallback, useMemo, useState } from "react";

export default function ImageUsages() {
  const [imageHistories, setImageHistories] = useState<ImagePromptHistory[]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callImageHistoriesApi = useCallback(async () => {
    const response = await callApi<ImageHistoriesGetResponse>({
      endpoint: `/image/histories?lastHashId=${lastHashId}`,
    });
    if (response) {
      setImageHistories((prev) => [
        ...(prev ?? []),
        ...response.imageHistories,
      ]);
    }
    if (response?.imageHistories.length === 0) {
      setSpinnerHidden(true);
    }
  }, [lastHashId]);

  const groupedImageHistories = useMemo(() => {
    type HistoryWithPriceSum = {
      [date: string]: { priceSum: number; histories: ImagePromptHistory[] };
    };
    const grouped = imageHistories?.reduce((acc: HistoryWithPriceSum, curr) => {
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
  }, [imageHistories]);

  const getColSpan = (length: number) => {
    if (length % 2 === 1) return "col-span-1";
    return "col-span-2";
  };
  const getMdColSpan = (length: number) => {
    const remainder = 5 - (length % 5);
    switch (remainder) {
      case 2:
        return "md:col-span-2";
      case 3:
        return "md:col-span-3";
      case 4:
        return "md:col-span-4";
      default:
        return "md:col-span-5";
    }
  };

  return (
    <List
      callApi={callImageHistoriesApi}
      emptyMessage="No usage yet"
      elements={imageHistories}
      spinnerHidden={spinnerHidden}
      useLastHashId={[lastHashId, setLastHashId]}
    >
      <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
        {groupedImageHistories?.map(([date, history], index) => (
          <Fragment key={date}>
            {history.histories.map((t) => (
              <div key={t.hashId}>
                <picture>
                  <img
                    className="w-full"
                    src={t.url}
                    alt="ai_generated_image"
                  />
                </picture>
                <div className="mt-3">
                  <ImageUsage imageHistory={t} />
                </div>
              </div>
            ))}
            <div
              className={`${getColSpan(
                history.histories.length
              )} ${getMdColSpan(history.histories.length)}`}
            ></div>
            {(spinnerHidden || index < groupedImageHistories.length) && (
              <Fragment>
                <div className="w-28 text-muted-foreground">Date</div>
                <div className="md:col-span-4 text-muted-foreground">Price</div>
                <div className="font-bold text-lg w-28">{date}</div>
                <div className="md:col-span-4 leading-7">
                  ${history.priceSum.toFixed(5)}
                </div>
                <div className="col-span-2 md:col-span-5 border-b"></div>
              </Fragment>
            )}
          </Fragment>
        ))}
      </div>
    </List>
  );
}
