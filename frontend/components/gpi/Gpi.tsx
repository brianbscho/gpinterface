import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { useCallback, useState } from "react";
import IconTextButton from "../buttons/IconTextButton";
import { MessageSquareCode, SquareCode } from "lucide-react";
import ModelSheetButton from "../buttons/ModelSheetButton";
import useUserStore from "@/store/user";
import Contents from "../Contents";
import Document from "./Document";

export default function Gpi({ gpi }: { gpi: GpiGetResponse }) {
  const [tab, setTab] = useState<"gpi" | "document">("gpi");
  const getTabContentClassName = useCallback(
    (_tab: string) => {
      const className = "w-full h-full pt-9 md:pt-0 overflow-hidden";
      if (tab === _tab) return className;
      return className + " hidden";
    },
    [tab]
  );
  const userHashId = useUserStore((state) => state.user?.hashId);

  return (
    <div
      key={gpi.hashId}
      className="w-full border border-theme rounded-md p-3 pb-[8.25rem]"
    >
      <div className="whitespace-pre-wrap pb-3">{gpi.description}</div>
      <div className="sticky top-0 md:top-3 w-full md:h-0 py-3 md:py-0 flex md:flex-col gap-3 bg-background z-30">
        <div>
          <IconTextButton
            onClick={() => setTab("gpi")}
            className="w-28 md:w-32"
            Icon={MessageSquareCode}
            text="GPI"
            selected={tab === "gpi"}
            responsive
          />
        </div>
        <div>
          <IconTextButton
            onClick={() => setTab("document")}
            className="w-28 md:w-32"
            Icon={SquareCode}
            text="Document"
            selected={tab === "document"}
            responsive
          />
        </div>
        <div>
          <ModelSheetButton editable={gpi.userHashId === userHashId} disabled />
        </div>
      </div>
      <div className={getTabContentClassName("gpi")}>
        {!!gpi && (
          <div className="md:pl-[8.75rem]">
            <Contents
              chat={gpi.chat}
              gpiHashId={gpi.hashId}
              ownerUserHashId={"non-editable-user"}
              hideButtons
            />
          </div>
        )}
      </div>
      <div className={getTabContentClassName("document")}>
        <Document gpi={gpi} />
      </div>
    </div>
  );
}
