"use client";

import { CircleX, FileCog } from "lucide-react";
import Link from "next/link";
import ContentStatic from "@/components/content/ContentStatic";
import { Badge } from "../ui";
import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import IconButton from "../buttons/IconButton";
import TooltipButton from "../buttons/TooltipButton";
import { useCallback } from "react";
import callApi from "@/utils/callApi";
import { DeleteResponse } from "gpinterface-shared/type";

type Props = { gpi: GpiGetResponse };
export default function GpiDraft({ gpi }: Props) {
  const onClickDelete = useCallback(async () => {
    const yes = confirm(
      "Are you sure you want to delete this? This action cannot be undone."
    );
    if (!yes) return;

    const response = await callApi<DeleteResponse>({
      endpoint: `/users/gpis/${gpi.hashId}`,
      method: "DELETE",
      showError: true,
    });
    if (response) {
      location.pathname = "/gpis/user";
    }
  }, [gpi]);

  return (
    <div className="w-full border border-neutral-500 rounded-md flex flex-col gap-3 p-3">
      <div className="flex gap-1 items-start pb-1 border-b-2 border-theme">
        <Badge variant="tag">Draft</Badge>
        <div className="flex-1"></div>
        <TooltipButton message="Edit">
          <Link href={`/gpis/${gpi.hashId}/edit`} className="flex">
            <IconButton Icon={FileCog} responsive />
          </Link>
        </TooltipButton>
        <TooltipButton message="Delete">
          <IconButton
            Icon={CircleX}
            variant="icon_destructive"
            responsive
            onClick={onClickDelete}
          />
        </TooltipButton>
      </div>
      <div className="pb-1 border-b border-neutral-500 font-bold text-xl w-full">
        Context
      </div>
      <div className="grid md:grid-cols-[auto_1fr] gap-3 items-start border-neutral-500">
        {gpi.systemMessage.length > 0 && (
          <ContentStatic role="system" content={gpi.systemMessage} />
        )}
        {gpi.chatContents.map((c) => (
          <ContentStatic key={c.hashId} {...c} />
        ))}
        {gpi.systemMessage.length === 0 && gpi.chatContents.length === 0 && (
          <div className="text-neutral-300 text-sm font-light">No context</div>
        )}
      </div>
    </div>
  );
}
