"use client";

import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { Info, Loader2 } from "lucide-react";
import useUserStore from "@/store/user";
import Document from "./Document";
import { Badge, Button } from "../ui";
import useModelStore from "@/store/model";
import { getApiConfig } from "@/utils/model";
import { stringify } from "@/utils/string";
import ContentStatic from "@/components/content/ContentStatic";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import GpiDropdown from "../dropdowns/GpiDropdown";

type Props = { gpi: GpiGetResponse };
export default function Gpi({ gpi }: Props) {
  const userHashId = useUserStore((state) => state.user?.hashId);

  const models = useModelStore((state) => state.models);
  const model = models.find((m) => m.hashId === gpi?.modelHashId);

  return (
    <div className="w-full border border-neutral-500 rounded-md flex flex-col gap-3 p-3">
      <div className="whitespace-pre-wrap">
        <div className="flex gap-1 items-start pb-1 border-b-2 border-theme">
          <Badge variant="tag">
            {!model?.name ? <Loader2 className="animate-spin" /> : model.name}
          </Badge>
          {!!model && (
            <Popover>
              <PopoverTrigger className="h-4">
                <div className="flex items-center text-sm">
                  <Button className="p-0 h-4 bg-background" variant="secondary">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="whitespace-pre-wrap w-auto px-3 py-2">
                <div className="text-sm text-neutral-400 text-wrap mt-1">
                  {Object.keys(gpi.config).length > 0
                    ? stringify(getApiConfig(model, gpi.config))
                    : "Default config"}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <div className="flex-1"></div>
          <GpiDropdown gpiHashId={gpi.hashId} />
        </div>
      </div>
      <div>{gpi.description}</div>
      <div className="pb-1 border-b border-neutral-500 font-bold text-xl w-full">
        Chat history
      </div>
      <div className="grid md:grid-cols-[auto_1fr] gap-3 items-start mb-12 border-neutral-500">
        {gpi.systemMessage.length > 0 && (
          <ContentStatic role="system" content={gpi.systemMessage} />
        )}
        {gpi.chatContents.map((c) => (
          <ContentStatic key={c.hashId} {...c} />
        ))}
        {gpi.systemMessage.length === 0 && gpi.chatContents.length === 0 && (
          <div className="text-neutral-300 text-sm font-light">
            No chat history
          </div>
        )}
      </div>
      <Document gpi={gpi} showWarning={gpi.userHashId !== userHashId} />
    </div>
  );
}
