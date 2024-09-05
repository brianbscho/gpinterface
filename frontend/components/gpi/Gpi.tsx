"use client";

import { GpiGetResponse } from "gpinterface-shared/type/gpi";
import { useCallback } from "react";
import IconTextButton from "../buttons/IconTextButton";
import { CircleX, FileCog, Info, LinkIcon } from "lucide-react";
import useUserStore from "@/store/user";
import Document from "./Document";
import { Badge, Button, useToast } from "../ui";
import GpiCopyButton from "../buttons/GpiCopyButton";
import Link from "next/link";
import useModelStore from "@/store/model";
import { getApiConfig } from "@/utils/model";
import { stringify } from "@/utils/string";
import ContentStatic from "@/components/content/ContentStatic";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = { gpi: GpiGetResponse };
export default function Gpi({ gpi }: Props) {
  const userHashId = useUserStore((state) => state.user?.hashId);

  const { toast } = useToast();
  const onClickShare = useCallback(() => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/gpis/${gpi.hashId}`
    );
    toast({ title: "Copied!", duration: 1000 });
  }, [gpi.hashId, toast]);

  const models = useModelStore((state) => state.models);
  const model = models.find((m) => m.hashId === gpi?.modelHashId);

  return (
    <div className="w-full border border-theme rounded-md flex flex-col gap-3 p-3">
      <div className="whitespace-pre-wrap">
        <div className="flex items-start">
          <Badge variant="tag">{model?.name ?? ""}</Badge>
          <Popover>
            <PopoverTrigger className="h-4">
              <div className="flex items-center text-sm">
                <Button className=" p-0 h-4 bg-background" variant="secondary">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent>
              {!!model && Object.keys(gpi.config).length > 0 && (
                <div className="text-sm text-neutral-400 text-wrap mt-1">
                  {stringify(getApiConfig(model, gpi.config))}
                </div>
              )}
            </PopoverContent>
          </Popover>
          <div className="flex-1"></div>
          <div>
            <div className="hidden md:block">
              <IconTextButton
                className="w-32"
                Icon={LinkIcon}
                text="Share"
                onClick={onClickShare}
              />
            </div>
            <div className="block md:hidden h-6">
              <Button className="p-1 h-6 w-6" onClick={onClickShare}>
                <LinkIcon />
              </Button>
            </div>
          </div>
          <div className="ml-3">
            <GpiCopyButton gpiHashId={gpi.hashId} />
          </div>
          {gpi.userHashId === userHashId && (
            <div className="ml-3">
              <Link href={`/chats/${gpi.chat.hashId}`}>
                <div className="hidden md:block">
                  <IconTextButton className="w-32" Icon={FileCog} text="Edit" />
                </div>
                <div className="block md:hidden h-6">
                  <Button className="p-1 h-6 w-6">
                    <FileCog />
                  </Button>
                </div>
              </Link>
            </div>
          )}
          {gpi.userHashId === userHashId && (
            <div className="ml-3">
              <Link href={`/chats/${gpi.chat.hashId}`}>
                <div className="hidden md:block">
                  <IconTextButton
                    className="w-32"
                    Icon={CircleX}
                    variant="icon_destructive"
                    text="Delete"
                  />
                </div>
                <div className="block md:hidden h-6">
                  <Button className="p-1 h-6 w-6" variant="destructive">
                    <CircleX />
                  </Button>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div>{gpi.description}</div>
      <div className="flex flex-col gap-3">
        {gpi.chat.systemMessage.length > 0 && (
          <ContentStatic role="system" content={gpi.chat.systemMessage} />
        )}
        {gpi.chat.contents.map((content) => (
          <ContentStatic key={content.hashId} {...content} />
        ))}
      </div>
      <Document gpi={gpi} className="px-0 md:pl-0" />
    </div>
  );
}
