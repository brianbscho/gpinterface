"use client";

import ImageUsage from "@/components/general/dialogs/ImageUsage";
import List from "@/components/List";
import callApi from "@/util/callApi";
import { stringify } from "@/util/string";
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
        ...(prev ? prev : []),
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

  return (
    <List
      callApi={callImageHistoriesApi}
      emptyMessage="No usage yet"
      elements={imageHistories}
      spinnerHidden={spinnerHidden}
      useLastHashId={[lastHashId, setLastHashId]}
    >
      <table className="border-spacing-3 border-separate w-full table-fixed">
        <thead>
          <tr>
            <td>Model</td>
            <td>Prompt</td>
            <td>Input</td>
            <td>Price</td>
            <td>Image</td>
            <td>Details</td>
          </tr>
        </thead>
        <tbody className="w-full">
          {groupedImageHistories?.map(([date, history], index) => (
            <Fragment key={date}>
              {history.histories.map((t) => (
                <tr key={t.hashId} className="w-full">
                  <td className="text-nowrap">{t.model}</td>
                  <td className="truncate w-full">{t.prompt}</td>
                  <td className="truncate w-full">{stringify(t.input)}</td>
                  <td className="text-nowrap">${t.price}</td>
                  <td>
                    <picture>
                      <img
                        className="h-40"
                        src={t.url}
                        alt="ai_generated_image"
                      />
                    </picture>
                  </td>
                  <td className="w-full">
                    <ImageUsage imageHistory={t} />
                  </td>
                </tr>
              ))}
              {(spinnerHidden || index < groupedImageHistories.length) && (
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
