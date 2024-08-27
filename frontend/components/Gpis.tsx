"use client";

import callApi from "@/utils/callApi";
import List from "./List";
import Contents from "./Contents";
import ModelSheetButton from "./buttons/ModelSheetButton";
import { GpisGetResponse } from "gpinterface-shared/type/gpi";
import IconTextButton from "./buttons/IconTextButton";
import { useCallback, useMemo, useState } from "react";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { BotMessageSquare, MessageSquareCode, SquareCode } from "lucide-react";
import Document from "@/app/gpis/[hashId]/Document";
import { Badge } from "./ui";
import useModelStore from "@/store/model";
import useModels from "@/hooks/useModels";

function Gpi({ gpi }: { gpi: GpiGetResponse }) {
  const [tab, setTab] = useState<"gpi" | "document">("gpi");
  const getTabContentClassName = useCallback(
    (_tab: string) => {
      const className = "w-full h-full overflow-hidden";
      if (tab === _tab) return className;
      return className + " hidden";
    },
    [tab]
  );

  const models = useModelStore((state) => state.models);
  const model = useMemo(
    () => models.find((m) => m.hashId === gpi.modelHashId),
    [models, gpi.modelHashId]
  );

  return (
    <div className="w-full">
      <div className="whitespace-pre-wrap">
        <Badge variant="tag" className="text-sm">
          {model?.name || "assistant"}
        </Badge>
        <div className="mt-1">{gpi?.description ?? ""}</div>
      </div>
      <div className="flex flex-col md:flex-row gap-3 items-start mt-0 md:mt-3">
        <div className="sticky w-full md:w-auto top-0 py-3 md:py-0 md:top-3 left-0 grid grid-cols-2 md:flex md:flex-col gap-3 bg-background z-20">
          <div>
            <IconTextButton
              onClick={() => setTab("gpi")}
              className="w-full md:w-32"
              Icon={MessageSquareCode}
              text="Prompts"
              selected={tab === "gpi"}
              responsive
            />
          </div>
          <div>
            <IconTextButton
              onClick={() => setTab("document")}
              className="w-full md:w-32"
              Icon={SquareCode}
              text="Document"
              selected={tab === "document"}
              responsive
            />
          </div>
          <div>
            <IconTextButton
              Icon={BotMessageSquare}
              text="Start chat"
              className="w-full md:w-32"
              responsive
            />
          </div>
          <div>
            <ModelSheetButton disabled />
          </div>
        </div>
        <div className="flex-1 w-full md:w-auto">
          <div className={getTabContentClassName("gpi")}>
            <div className="w-full h-full">
              <Contents
                chat={gpi.chat}
                gpiHashId={gpi.hashId}
                ownerUserHashId={"non-editable"}
              />
            </div>
          </div>
          <div className={getTabContentClassName("document")}>
            <Document gpi={gpi} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Gpis() {
  const [gpis, setGpis] = useState<GpisGetResponse["gpis"]>();
  const [lastHashId, setLastHashId] = useState("");
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const callGpisApi = useCallback(async () => {
    const response = await callApi<GpisGetResponse>({
      endpoint: `/gpis?lastHashId=${lastHashId}`,
    });
    if (response) {
      setGpis((prev) => [...(prev ?? []), ...response.gpis]);
      if (response.gpis.length === 0) {
        setSpinnerHidden(true);
      }
    }
  }, [lastHashId]);
  useModels();

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="w-fulll h-full overflow-y-auto">
        <div className="w-full max-w-4xl flex flex-col items-center gap-12 mx-auto">
          <List
            callApi={callGpisApi}
            emptyMessage=""
            elements={gpis}
            spinnerHidden={spinnerHidden}
            useLastHashId={[lastHashId, setLastHashId]}
          >
            {!!gpis &&
              [
                ...gpis,
                ...gpis,
                ...gpis,
                ...gpis,
                ...gpis,
                ...gpis,
                ...gpis,
              ].map((g) => (
                <div key={g.hashId} className="w-full p-3">
                  <Gpi gpi={g} />
                </div>
              ))}
          </List>
        </div>
      </div>
    </div>
  );
}
